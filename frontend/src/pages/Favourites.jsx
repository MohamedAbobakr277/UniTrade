import React, { useState, useEffect } from 'react';
import { Box, Typography, IconButton, Grid, Button, Skeleton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import EmptyState from '../components/EmptyState';
import ItemCard from '../components/ItemCard';
import { auth, db } from '../firebase';
import { doc, onSnapshot, collection, query, getDocs } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export default function Favourites() {
  const [items, setItems] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let unsubUser;
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        unsubUser = onSnapshot(userRef, async (docSnap) => {
          if (docSnap.exists()) {
            const favs = docSnap.data().favourites || [];
            if (favs.length > 0) {
              const q = query(collection(db, "products"));
              const snapshot = await getDocs(q);
              const data = snapshot.docs
                .map(d => ({ id: d.id, ...d.data() }))
                .filter(item => favs.includes(item.id));
              setItems(data);
            } else {
              setItems([]);
            }
          }
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    return () => {
      unsubAuth();
      if (unsubUser) unsubUser();
    };
  }, []);

  const displayedItems = items.filter((item) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.title?.toLowerCase().includes(q) ||
      item.description?.toLowerCase().includes(q) ||
      item.category?.toLowerCase().includes(q)
    );
  });

  return (
    <Box sx={{ minHeight: "100vh", background: "background.default" }}>
      <Navbar items={items} search={searchQuery} onSearch={setSearchQuery} setSearch={setSearchQuery} />
      <Box sx={{ p: { xs: 2, md: 5 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 3 }}>
          <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/profile')}
              sx={{
                  textTransform: "none",
                  fontWeight: 700,
                  color: "text.secondary",
                  bgcolor: "background.paper",
                  px: 2.5,
                  py: 0.8,
                  borderRadius: "12px",
                  boxShadow: (theme) => theme.palette.mode === 'light' ? "0 4px 14px rgba(0,0,0,0.03)" : "none",
                  border: "1px solid",
                  borderColor: "divider",
                  transition: "all 0.2s ease",
                  "&:hover": {
                      bgcolor: "background.subtle",
                      color: "text.primary",
                      transform: "translateX(-4px)",
                  },
              }}
          >
              Back to Profile
          </Button>
          <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', m: 0 }}>My Favourites</Typography>
        </Box>

        {loading ? (
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 3, width: "100%" }}>
              <Skeleton variant="rectangular" height={360} sx={{ borderRadius: 4 }} />
              <Skeleton variant="rectangular" height={360} sx={{ borderRadius: 4 }} />
              <Skeleton variant="rectangular" height={360} sx={{ borderRadius: 4 }} />
          </Box>
        ) : displayedItems.length > 0 ? (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: 3,
              width: "100%",
              alignItems: "stretch",
            }}
          >
            {displayedItems.map((item) => (
              <Box key={item.id} sx={{ display: 'flex' }}>
                <ItemCard item={item} />
              </Box>
            ))}
          </Box>
        ) : (
          <EmptyState 
            title={searchQuery ? "No Matches Found" : "No Favourites Yet"}
            description={searchQuery ? `No favourites matched "${searchQuery}".` : "You haven't added any items to your favourites. Start exploring to find items you like!"}
            iconType="favorite"
            ctaText={searchQuery ? "Clear Search" : "Explore Items"}
            ctaLink={searchQuery ? "#" : "/home"}
            onCtaClick={searchQuery ? () => setSearchQuery("") : undefined}
          />
        )}
      </Box>
      <Footer />
    </Box>
  );
}
