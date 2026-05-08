import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, IconButton, TextField, Paper, Avatar, Zoom, Fab, Slide, Tooltip } from '@mui/material';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import CloseIcon from '@mui/icons-material/Close';
import MinimizeIcon from '@mui/icons-material/Minimize';
import RefreshIcon from '@mui/icons-material/Refresh';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { useLocation } from 'react-router-dom';

export default function AIChatbot() {
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const [showWelcome, setShowWelcome] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [userName, setUserName] = useState('User');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setCurrentUser(user);
            if (user) {
                try {
                    const userDoc = await getDoc(doc(db, "users", user.uid));
                    if (userDoc.exists()) {
                        const data = userDoc.data();
                        setUserName(data.firstName || data.name || 'Student');
                    }
                } catch (e) {
                    console.error("Error fetching user for chatbot:", e);
                }
            }
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (!currentUser) return; // Only start timers after user is logged in

        // Show premium welcome bubble after 5 seconds
        const showTimer = setTimeout(() => {
            if (!isOpen) setShowWelcome(true);
        }, 5000);

        // Automatically hide it after 12 seconds (gives them 7s to read it)
        const hideTimer = setTimeout(() => {
            setShowWelcome(false);
        }, 12000);

        return () => {
            clearTimeout(showTimer);
            clearTimeout(hideTimer);
        };
    }, [isOpen, currentUser]);

    useEffect(() => {
        if (isOpen && messages.length === 0) {
            setMessages([
                { id: 1, text: `Hi ${userName}! What can I help you with?`, sender: 'ai' }
            ]);
        }
    }, [isOpen, userName, messages.length]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    const handleSend = () => {
        if (!inputValue.trim()) return;

        const newMsg = { id: Date.now(), text: inputValue, sender: 'user' };
        setMessages(prev => [...prev, newMsg]);
        setInputValue('');
        setIsTyping(true);

        fetchGeminiResponse([...messages, newMsg]);
    };

    const fetchGeminiResponse = async (chatHistory) => {
        try {
            const validHistory = [];
            let lastRole = '';

            chatHistory.forEach(msg => {
                const currentRole = msg.sender === 'ai' ? 'model' : 'user';
                // Skip the initial AI greeting to ensure sequence starts with 'user'
                if (validHistory.length === 0 && currentRole === 'model') return;

                if (currentRole !== lastRole) {
                    validHistory.push({ role: currentRole, parts: [{ text: msg.text }] });
                    lastRole = currentRole;
                } else if (validHistory.length > 0) {
                    validHistory[validHistory.length - 1].parts[0].text += " \n " + msg.text;
                }
            });

            if (validHistory.length > 0 && validHistory[0].role === 'user') {
                validHistory[0].parts[0].text = `System Prompt: You are a helpful, friendly, and concise support AI assistant for 'UniTrade', an exclusive peer-to-peer marketplace for Egyptian university students. Do not invent features that don't exist. Keep your answers short and polite.\n\nUser: ` + validHistory[0].parts[0].text;
            }

            const backendUrl = (import.meta.env.VITE_API_URL || "http://localhost:3000").replace(/\/$/, '');

            // Get user token for authentication
            const token = auth.currentUser ? await auth.currentUser.getIdToken() : null;

            const response = await fetch(`${backendUrl}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : ''
                },
                body: JSON.stringify({ chatHistory: validHistory })
            });

            const data = await response.json();

            if (data.error) {
                throw new Error(typeof data.error === 'string' ? data.error : data.error.message || "Unknown AI Error");
            }

            const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm not sure how to answer that.";

            setIsTyping(false);
            setMessages(prev => [...prev, { id: Date.now() + 1, text: aiText, sender: 'ai' }]);
        } catch (error) {
            console.error("AI Fetch Error:", error);
            setIsTyping(false);

            // Check if it's a Google Rate Limit / Quota Error
            let errorMessage = error.message || "Make sure your backend server is running on port 5000!";
            if (errorMessage.toLowerCase().includes('api quota exceeded')) {
                errorMessage = "The AI service has reached its usage limit. Please try again later.";
            } else if (errorMessage.toLowerCase().includes('too many messages')) {
                errorMessage = "You're sending messages too quickly. Please wait a moment and try again.";
            } else if (errorMessage.toLowerCase().includes('quota') || errorMessage.toLowerCase().includes('429')) {
                errorMessage = "I'm receiving too many messages right now! Please wait 60 seconds and ask me again.";
            } else {
                errorMessage = `Error connecting: ${errorMessage}`;
            }

            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                text: errorMessage,
                sender: 'ai'
            }]);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSend();
        }
    };

    // Strict Security Check: Hide on Login/Signup pages regardless of auth state caching
    if (['/login', '/signup', '/'].includes(location.pathname)) return null;
    if (!currentUser) return null; // Only show for logged in users

    return (
        <>
            <Zoom in={!isOpen}>
                <Tooltip
                    title={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5, px: 0.5 }}>
                            <AutoAwesomeIcon sx={{ fontSize: 16, color: '#60a5fa' }} />
                            <Typography sx={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.9rem', fontWeight: 600, letterSpacing: '0.2px' }}>
                                Chat with UniTrade AI
                            </Typography>
                        </Box>
                    }
                    placement="right"
                    arrow
                    TransitionComponent={Zoom}
                    slotProps={{
                        tooltip: {
                            sx: {
                                bgcolor: (theme) => theme.palette.mode === 'light' ? 'rgba(255, 255, 255, 0.95)' : 'rgba(30, 41, 59, 0.95)',
                                backdropFilter: 'blur(10px)',
                                boxShadow: '0 8px 30px rgba(37,99,235,0.15)',
                                border: '1px solid',
                                borderColor: 'divider',
                                borderRadius: '12px',
                                p: 1,
                                ml: 2,
                                color: 'text.primary'
                            }
                        },
                        arrow: {
                            sx: { color: (theme) => theme.palette.mode === 'light' ? 'rgba(255, 255, 255, 0.95)' : 'rgba(30, 41, 59, 0.95)' }
                        }
                    }}
                >
                    <Fab
                        color="primary"
                        aria-label="chat"
                        onClick={() => { setIsOpen(true); setShowWelcome(false); }}
                        sx={{
                            position: 'fixed',
                            bottom: { xs: 16, sm: 24 },
                            right: { xs: 16, sm: 24 },
                            zIndex: 9999,
                            width: { xs: 50, sm: 60 },
                            height: { xs: 50, sm: 60 },
                            background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #3b82f6 100%)',
                            color: 'white',
                            '&:hover': { background: 'linear-gradient(135deg, #1e3a8a, #1d4ed8)', transform: 'scale(1.08) translateY(-4px)' },
                            boxShadow: '0 12px 30px -4px rgba(37, 99, 235, 0.5), 0 4px 12px -2px rgba(37, 99, 235, 0.3)',
                            transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                            animation: 'pulseGlowPremium 3s infinite alternate'
                        }}
                    >
                        <ChatBubbleOutlineIcon />
                    </Fab>
                </Tooltip>
            </Zoom>

            {/* Premium Intercom-Style Welcome Bubble */}
            <Zoom in={showWelcome && !isOpen}>
                <Paper
                    elevation={12}
                    sx={{
                        position: 'fixed',
                        bottom: { xs: 24, sm: 34 },
                        right: { xs: 76, sm: 100 },
                        zIndex: 9998,
                        maxWidth: 260,
                        p: 2,
                        borderRadius: '20px 20px 20px 4px',
                        background: (theme) => theme.palette.mode === 'light' ? 'rgba(255, 255, 255, 0.95)' : 'rgba(30, 41, 59, 0.95)',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid',
                        borderColor: 'divider',
                        boxShadow: (theme) => theme.palette.mode === 'light' ? '0 12px 40px -10px rgba(37,99,235,0.25)' : '0 12px 40px -10px rgba(0,0,0,0.5)',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 1.5,
                        transition: 'all 0.3s ease-in-out'
                    }}
                >
                    <IconButton
                        size="small"
                        onClick={(e) => { e.stopPropagation(); setShowWelcome(false); }}
                        sx={{ position: 'absolute', top: 4, right: 4, color: 'text.secondary', width: 20, height: 20, '&:hover': { color: 'text.primary', bgcolor: 'background.subtle' } }}
                    >
                        <CloseIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                    <Avatar sx={{ width: 36, height: 36, background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)', boxShadow: '0 4px 10px rgba(37,99,235,0.3)' }}>
                        <AutoAwesomeIcon sx={{ fontSize: 18, color: '#fff' }} />
                    </Avatar>
                    <Box sx={{ mt: 0.5, cursor: 'pointer', pr: 1 }} onClick={() => { setIsOpen(true); setShowWelcome(false); }}>
                        <Typography sx={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.95rem', fontWeight: 800, color: 'text.primary', mb: 0.5, lineHeight: 1.2 }}>
                            Hi {userName}! 👋
                        </Typography>
                        <Typography sx={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.8rem', color: 'text.secondary', lineHeight: 1.4 }}>
                            Looking for a specific item? Just ask and I'll help you find it fast.
                        </Typography>
                    </Box>
                </Paper>
            </Zoom>

            <Slide direction="up" in={isOpen} mountOnEnter unmountOnExit>
                <Paper
                    elevation={12}
                    sx={{
                        position: 'fixed',
                        bottom: { xs: 16, sm: 24 },
                        right: { xs: 16, sm: 24 },
                        width: { xs: 'calc(100% - 32px)', sm: 400 },
                        height: 650,
                        maxHeight: 'calc(100vh - 48px)',
                        zIndex: 9999,
                        display: 'flex',
                        flexDirection: 'column',
                        borderRadius: '28px',
                        overflow: 'hidden',
                        boxShadow: (theme) => theme.palette.mode === 'light' ? '0 24px 60px -12px rgba(15,23,42,0.2), 0 0 1px rgba(0,0,0,0.1)' : '0 24px 60px -12px rgba(0,0,0,0.5)',
                        backgroundColor: 'background.paper',
                        border: '1px solid',
                        borderColor: 'divider'
                    }}
                >
                    {/* Header (Glassmorphic) */}
                    <Box sx={{
                        background: (theme) => theme.palette.mode === 'light' ? 'rgba(255, 255, 255, 0.85)' : 'rgba(15, 23, 42, 0.85)',
                        backdropFilter: 'blur(20px)',
                        WebkitBackdropFilter: 'blur(20px)',
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        color: 'text.primary',
                        px: 3,
                        py: 2.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        zIndex: 2,
                    }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar sx={{ width: 28, height: 28, bgcolor: 'transparent' }}>
                                {/* Decorative AI Icon */}
                                <Box sx={{
                                    width: 32, height: 32,
                                    borderRadius: '10px',
                                    background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    boxShadow: '0 4px 12px rgba(37,99,235,0.3)',
                                    transform: 'rotate(-10deg)'
                                }}>
                                    <AutoAwesomeIcon sx={{ fontSize: 18, color: 'white' }} />
                                </Box>
                            </Avatar>
                            <Box>
                                <Typography sx={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '1.05rem', letterSpacing: '-0.3px', lineHeight: 1.1 }}>
                                    UniTrade Support
                                </Typography>
                                <Typography sx={{ fontFamily: 'Outfit, sans-serif', fontWeight: 500, fontSize: '0.75rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#10b981', animation: 'pulseGlowPremium 2s infinite alternate' }} />
                                    Online Now
                                </Typography>
                            </Box>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <Tooltip title="Reset Conversation">
                                <IconButton size="small" onClick={() => setMessages([{ id: 1, text: `Hi ${userName}! What can I help you with?`, sender: 'ai' }])} sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main', bgcolor: 'background.subtle' } }}>
                                    <RefreshIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                            <IconButton size="small" onClick={() => setIsOpen(false)} sx={{ color: 'text.secondary', '&:hover': { color: 'error.main', bgcolor: 'background.subtle' } }}>
                                <MinimizeIcon fontSize="small" sx={{ mb: 1 }} />
                            </IconButton>
                        </Box>
                    </Box>

                    {/* Chat Body */}
                    <Box sx={{ flex: 1, overflowY: 'auto', p: 3, display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
                        <Typography sx={{ textAlign: 'center', color: 'text.secondary', fontSize: '0.75rem', fontWeight: 500, letterSpacing: '0.5px', textTransform: 'uppercase', mt: 1, mb: 4, px: 2 }}>
                            Today
                        </Typography>

                        {messages.map((msg) => (
                            <Box
                                key={msg.id}
                                sx={{
                                    display: 'flex',
                                    justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                                    mb: 2.5,
                                    animation: 'messageSlideUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.1) forwards',
                                    transformOrigin: msg.sender === 'user' ? 'bottom right' : 'bottom left',
                                }}
                            >
                                <Box sx={{
                                    maxWidth: '85%',
                                    py: 1.5,
                                    px: 2.5,
                                    borderRadius: msg.sender === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                                    background: msg.sender === 'user' ? 'linear-gradient(135deg, #1e3a8a, #2563eb)' : 'background.paper',
                                    color: msg.sender === 'user' ? '#ffffff' : 'text.primary',
                                    boxShadow: msg.sender === 'user' ? '0 10px 25px -5px rgba(37,99,235,0.4)' : (theme) => theme.palette.mode === 'light' ? '0 4px 15px rgba(0,0,0,0.03)' : 'none',
                                    border: '1px solid',
                                    borderColor: 'divider',
                                }}>
                                    <Typography sx={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.95rem', lineHeight: 1.6, fontWeight: 400, wordBreak: 'break-word' }}>
                                        {msg.text}
                                    </Typography>
                                </Box>
                            </Box>
                        ))}

                        {isTyping && (
                            <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2.5, animation: 'messageSlideUp 0.4s ease forwards' }}>
                                <Box sx={{
                                    py: 2,
                                    px: 2.5,
                                    borderRadius: '20px 20px 20px 4px',
                                    backgroundColor: 'background.paper',
                                    boxShadow: (theme) => theme.palette.mode === 'light' ? '0 4px 15px rgba(0,0,0,0.03)' : 'none',
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    display: 'flex',
                                    gap: 0.5
                                }}>
                                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'primary.main', animation: 'bounce 1.4s infinite ease-in-out both' }} />
                                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'primary.main', animation: 'bounce 1.4s infinite ease-in-out both', animationDelay: '0.2s' }} />
                                    <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'primary.main', animation: 'bounce 1.4s infinite ease-in-out both', animationDelay: '0.4s' }} />
                                </Box>
                            </Box>
                        )}
                        <div ref={messagesEndRef} />
                    </Box>

                    {/* Input Area (Floating Style) */}
                    <Box sx={{ p: 2.5, pt: 1, position: 'relative', bgcolor: 'background.paper', borderTop: '1px solid', borderColor: 'divider' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'center', position: 'absolute', top: -16, left: 0, right: 0 }}>
                            <IconButton
                                onClick={() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })}
                                sx={{
                                    bgcolor: 'background.paper',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    '&:hover': { bgcolor: 'background.subtle', transform: 'translateY(2px)' },
                                    width: 32, height: 32,
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                <KeyboardArrowDownIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                            </IconButton>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                            <TextField
                                fullWidth
                                variant="outlined"
                                placeholder="Message UniTrade Support..."
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyPress}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '30px',
                                        backgroundColor: 'background.subtle',
                                        pr: 1,
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                                        '& fieldset': { border: '1px solid', borderColor: 'divider' },
                                        '&:hover fieldset': { borderColor: 'primary.main' },
                                        '&.Mui-focused fieldset': { borderColor: 'primary.main', borderWidth: '2px' },
                                    },
                                    '& .MuiOutlinedInput-input': {
                                        py: 1.8,
                                        px: 2.5,
                                        fontSize: '0.95rem',
                                        fontFamily: 'Outfit, sans-serif',
                                        color: 'text.primary'
                                    }
                                }}
                                InputProps={{
                                    endAdornment: (
                                        <IconButton
                                            onClick={handleSend}
                                            disabled={!inputValue.trim() || isTyping}
                                            sx={{
                                                color: inputValue.trim() ? '#ffffff' : '#cbd5e1',
                                                bgcolor: inputValue.trim() ? '#2563eb' : 'transparent',
                                                '&:hover': { bgcolor: inputValue.trim() ? '#1d4ed8' : 'transparent' },
                                                transition: 'all 0.2s',
                                                p: 1.2,
                                                mr: 0.5
                                            }}
                                        >
                                            <SendOutlinedIcon />
                                        </IconButton>
                                    )
                                }}
                            />
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, mt: 1.5 }}>
                            <AutoAwesomeIcon sx={{ fontSize: 14, color: 'primary.main' }} />
                            <Typography sx={{ fontFamily: 'Outfit, sans-serif', fontSize: '0.8rem', color: 'text.secondary', fontWeight: 500 }}>
                                Powered by UniTrade AI
                            </Typography>
                        </Box>
                    </Box>
                </Paper>
            </Slide>

            <style>{`
                @keyframes bounce {
                    0%, 80%, 100% { transform: scale(0); }
                    40% { transform: scale(1); }
                }
                @keyframes messageSlideUp {
                    0% { opacity: 0; transform: translateY(15px) scale(0.95); }
                    100% { opacity: 1; transform: translateY(0) scale(1); }
                }
                @keyframes pulseGlowPremium {
                    0% { box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.4); }
                    70% { box-shadow: 0 0 0 15px rgba(37, 99, 235, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(37, 99, 235, 0); }
                }
            `}</style>
        </>
    );
}
