import React, { useState, useEffect } from 'react';
import { Box, Typography, IconButton, Grid, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ItemCard from '../components/ItemCard';
import { auth, db } from '../firebase';
import { doc, onSnapshot, collection, query, getDocs } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

export default function Favourites() {
  const [items, setItems] = useState([]);
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

  return (
    <Box sx={{ minHeight: "100vh", background: "#f8fbff" }}>
      <Navbar />
      <Box sx={{ p: { xs: 2, md: 5 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2, mb: 3 }}>
          <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/profile')}
              sx={{
                  textTransform: "none",
                  fontWeight: 700,
                  color: "#64748b",
                  bgcolor: "#ffffff",
                  px: 2.5,
                  py: 0.8,
                  borderRadius: "12px",
                  boxShadow: "0 4px 14px rgba(0,0,0,0.03)",
                  border: "1px solid #e2e8f0",
                  transition: "all 0.2s ease",
                  "&:hover": {
                      bgcolor: "#f8fafc",
                      color: "#0f172a",
                      transform: "translateX(-4px)",
                      boxShadow: "0 6px 16px rgba(0,0,0,0.06)",
                  },
              }}
          >
              Back to Profile
          </Button>
          <Typography variant="h4" sx={{ fontWeight: 800, color: '#0f172a', m: 0 }}>My Favourites</Typography>
        </Box>

        {loading ? (
          <Typography sx={{ color: '#64748b', fontSize: '1.1rem' }}>Loading favourites...</Typography>
        ) : items.length > 0 ? (
          <Grid container spacing={3}>
            {items.map((item) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={item.id} sx={{ display: 'flex' }}>
                <ItemCard item={item} />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography sx={{ color: '#64748b', fontSize: '1.1rem' }}>You have not added any favourites yet.</Typography>
        )}
      </Box>
    </Box>
  );
}
