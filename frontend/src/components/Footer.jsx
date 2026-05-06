import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  IconButton,
  Divider,
  Fab,
  Zoom,
  useTheme,
} from "@mui/material";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import XIcon from "@mui/icons-material/X";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import SellOutlinedIcon from "@mui/icons-material/SellOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import logo from "../assets/logo.png";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";

/* ─── Style Constants ─── */
const DARK_BG = "linear-gradient(175deg, #347aecff 0%, #164a9cff 100%)";
const ACCENT = "#12284bff";
const ACCENT_HOVER = "#174277ff";
const TEXT_PRIMARY = "#140b66ff";
const TEXT_SECONDARY = "#000000ff";
const TEXT_MUTED = "#0f0646ff";
const DIVIDER_COLOR = "#114ca5ff";

const linkSx = {
  color: TEXT_SECONDARY,
  fontSize: "0.95rem",
  fontWeight: 500,
  display: "flex",
  alignItems: "center",
  gap: 1.5,
  width: "fit-content",
  transition: "all 0.3s ease",
  "&:hover": {
    color: "#ffffff",
    transform: "translateX(6px)",
    "& .link-icon": {
      color: ACCENT_HOVER,
      transform: "scale(1.1)",
    },
  },
};

const sectionTitleSx = {
  color: TEXT_PRIMARY,
  fontWeight: 700,
  fontSize: "1.1rem",
  mb: 3,
  letterSpacing: "0.02em",
  position: "relative",
  "&::after": {
    content: '""',
    position: "absolute",
    bottom: -10,
    left: 0,
    width: 32,
    height: 3,
    borderRadius: 1.5,
    background: `linear-gradient(90deg, ${ACCENT}, ${ACCENT_HOVER})`,
  },
};

/* ─── Social Media Config ─── */
const socials = [
  { icon: <FacebookIcon />, label: "Facebook", color: "#1877F2", href: "#" },
  { icon: <InstagramIcon />, label: "Instagram", color: "#E4405F", href: "#" },
  { icon: <XIcon />, label: "X", color: "#ffffff", href: "#" },
  { icon: <LinkedInIcon />, label: "LinkedIn", color: "#0A66C2", href: "#" },
  { icon: <WhatsAppIcon />, label: "WhatsApp", color: "#25D366", href: "https://wa.me/201554104166" },
];

/* ─── Quick Links ─── */
const quickLinks = [
  { name: "Home", icon: <HomeOutlinedIcon sx={{ fontSize: 20 }} />, path: "/home" },
  { name: "Sell an Item", icon: <SellOutlinedIcon sx={{ fontSize: 20 }} />, path: "/sell" },
  { name: "My Profile", icon: <PersonOutlinedIcon sx={{ fontSize: 20 }} />, path: "/profile" },
  { name: "Favourites", icon: <FavoriteBorderIcon sx={{ fontSize: 20 }} />, path: "/favourites" },
];

/* ─── Contact Info ─── */
const contactInfo = [
  { icon: <EmailOutlinedIcon sx={{ fontSize: 20 }} />, text: "support@unitrade.eg", href: "mailto:[support@unitrade.eg]" },
  { icon: <PhoneOutlinedIcon sx={{ fontSize: 20 }} />, text: "+20 155 410 4166", href: "tel:+201554104166" },
  { icon: <LocationOnOutlinedIcon sx={{ fontSize: 20 }} />, text: "Giza, Egypt", href: null },
];

export default function Footer() {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();
  const [showBackToTop, setShowBackToTop] = useState(false);
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  /* ─── Dynamic Theme Colors ─── */
  const footerBg = isDark 
    ? "linear-gradient(180deg, #0f172a 0%, #020617 100%)" 
    : DARK_BG;
  
  const currentTextPrimary = isDark ? "#ffffff" : TEXT_PRIMARY;
  const currentTextSecondary = isDark ? "rgba(255,255,255,0.7)" : TEXT_SECONDARY;
  const currentTextMuted = isDark ? "rgba(255,255,255,0.5)" : TEXT_MUTED;
  const currentDivider = isDark ? "rgba(255,255,255,0.1)" : DIVIDER_COLOR;
  const currentAccent = isDark ? "#3b82f6" : ACCENT;

  /* ─── Scroll Listener for Back-to-Top ─── */
  const handleScroll = useCallback(() => {
    setShowBackToTop(window.scrollY > 400);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <Box
        component="footer"
        sx={{
          background: footerBg,
          pt: { xs: 6, md: 8 },
          pb: 0,
          mt: "auto",
          position: "relative",
          overflow: "hidden",
          borderTop: isDark ? "1px solid" : "none",
          borderColor: "rgba(255,255,255,0.05)",
          /* Decorative glow */
          "&::before": {
            content: '""',
            position: "absolute",
            top: -160,
            right: -80,
            width: 380,
            height: 380,
            borderRadius: "50%",
            background: isDark 
              ? `radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)`
              : `radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)`,
            pointerEvents: "none",
          },
          "&::after": {
            content: '""',
            position: "absolute",
            bottom: -120,
            left: -60,
            width: 300,
            height: 300,
            borderRadius: "50%",
            background: `radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)`,
            pointerEvents: "none",
          },
        }}
      >
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          <Grid container spacing={{ xs: 5, md: 6 }}>

            {/* ════════════════════ ABOUT ════════════════════ */}
            <Grid size={{ xs: 12, md: 5 }}>
              <Box
                onClick={() => navigate("/home")}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  mb: 2.5,
                  cursor: "pointer",
                  width: "fit-content",
                  transition: "opacity 0.3s",
                  "&:hover": { opacity: 0.85 },
                }}
              >
                <Box
                  component="img"
                  src={logo}
                  alt="UniTrade Logo"
                  sx={{
                    height: 85,
                    width: "auto",
                    filter: "drop-shadow(0 2px 8px rgba(59,130,246,0.3))",
                  }}
                />
                <Box>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 800, color: currentTextPrimary, lineHeight: 1, fontSize: "1.25rem" }}
                  >
                    UniTrade
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: currentAccent, fontWeight: 600, letterSpacing: "0.04em" }}
                  >
                    Campus Marketplace
                  </Typography>
                </Box>
              </Box>

              <Typography
                sx={{
                  color: currentTextSecondary,
                  mb: 3.5,
                  maxWidth: 320,
                  lineHeight: 1.75,
                  fontSize: "0.9rem",
                }}
              >
                The most trusted marketplace for university students across Egypt.
                Buy, sell, and trade with your peers — safely and easily.
              </Typography>

              {/* Social Icons */}
              <Box sx={{ display: "flex", gap: 1 }}>
                {socials.map((s) => (
                  <IconButton
                    key={s.label}
                    component="a"
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    size="small"
                    sx={{
                      color: isDark ? "rgba(255,255,255,0.8)" : TEXT_MUTED,
                      border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : DIVIDER_COLOR}`,
                      backgroundColor: "rgba(255,255,255,0.04)",
                      width: 38,
                      height: 38,
                      transition: "all 0.3s cubic-bezier(.4,0,.2,1)",
                      "&:hover": {
                        color: "#fff",
                        backgroundColor: s.color,
                        borderColor: s.color,
                        transform: "translateY(-3px)",
                        boxShadow: `0 6px 20px ${s.color}40`,
                      },
                    }}
                  >
                    {s.icon}
                  </IconButton>
                ))}
              </Box>
            </Grid>

            {/* ════════════════════ QUICK LINKS ════════════════════ */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Typography sx={{ ...sectionTitleSx, color: currentTextPrimary, "&::after": { ...sectionTitleSx["&::after"], background: isDark ? currentAccent : sectionTitleSx["&::after"].background } }}>Quick Links</Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1.5 }}>
                {quickLinks.map((link) => (
                  <Link
                    key={link.name}
                    underline="none"
                    sx={{ 
                      ...linkSx, 
                      color: currentTextSecondary,
                      cursor: "pointer",
                      "&:hover": {
                        ...linkSx["&:hover"],
                        color: isDark ? "#fff" : "#ffffff",
                      }
                    }}
                    onClick={() => navigate(link.path)}
                  >
                    <Box className="link-icon" sx={{ color: currentAccent, display: "flex", alignItems: "center", transition: "all 0.3s ease" }}>
                      {link.icon}
                    </Box>
                    {link.name}
                  </Link>
                ))}
              </Box>
            </Grid>

            {/* ════════════════════ CONTACT ════════════════════ */}
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Typography sx={{ ...sectionTitleSx, color: currentTextPrimary, "&::after": { ...sectionTitleSx["&::after"], background: isDark ? currentAccent : sectionTitleSx["&::after"].background } }}>Contact Us</Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1.5 }}>
                {contactInfo.map((item, idx) => (
                  <Box key={idx} sx={{ display: "flex", alignItems: "center" }}>
                    {item.href ? (
                      <Link
                        href={item.href}
                        underline="none"
                        sx={{ 
                          ...linkSx, 
                          color: currentTextSecondary,
                          "&:hover": {
                            ...linkSx["&:hover"],
                            color: isDark ? "#fff" : "#ffffff",
                          }
                        }}
                      >
                        <Box className="link-icon" sx={{ color: currentAccent, display: "flex", alignItems: "center", transition: "all 0.3s ease" }}>
                          {item.icon}
                        </Box>
                        {item.text}
                      </Link>
                    ) : (
                      <Box sx={{ ...linkSx, color: currentTextSecondary, cursor: "default", "&:hover": { color: currentTextSecondary, transform: "none" } }}>
                        <Box sx={{ color: currentAccent, display: "flex", alignItems: "center" }}>
                          {item.icon}
                        </Box>
                        {item.text}
                      </Box>
                    )}
                  </Box>
                ))}
              </Box>
            </Grid>
          </Grid>

          {/* ════════════════════ DIVIDER ════════════════════ */}
          <Divider sx={{ borderColor: currentDivider, mt: { xs: 5, md: 6 }, mb: 0 }} />

          {/* ════════════════════ BOTTOM BAR ════════════════════ */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              justifyContent: "space-between",
              alignItems: "center",
              gap: 1.5,
              py: 3,
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: currentTextMuted,
                fontWeight: 500,
                fontSize: "0.82rem",
                textAlign: { xs: "center", sm: "left" },
              }}
            >
              © {currentYear} UniTrade Egypt. All rights reserved. Built with ❤️ for Students.
            </Typography>

            <Box sx={{ display: "flex", gap: { xs: 2.5, sm: 4 }, flexWrap: "wrap", justifyContent: "center" }}>
              {["Privacy", "Terms", "Cookies"].map((text) => (
                <Link
                  key={text}
                  href="#"
                  underline="none"
                  sx={{
                    color: currentTextMuted,
                    fontSize: "0.82rem",
                    fontWeight: 500,
                    transition: "color 0.25s",
                    "&:hover": { color: isDark ? "#fff" : ACCENT_HOVER },
                  }}
                >
                  {text}
                </Link>
              ))}
            </Box>
          </Box>
        </Container>
      </Box>

      {/* ════════════════════ BACK TO TOP FAB ════════════════════ */}
      <Zoom in={showBackToTop}>
        <Fab
          onClick={scrollToTop}
          aria-label="Back to top"
          size="medium"
          sx={{
            position: "fixed",
            bottom: 32,
            right: 32,
            background: `linear-gradient(135deg, ${currentAccent} 0%, #6366f1 100%)`,
            color: "#fff",
            boxShadow: "0 6px 24px rgba(59,130,246,0.35)",
            transition: "all 0.3s cubic-bezier(.4,0,.2,1)",
            "&:hover": {
              transform: "translateY(-3px)",
              boxShadow: "0 10px 32px rgba(59,130,246,0.45)",
              background: `linear-gradient(135deg, ${currentAccent} 0%, #818cf8 100%)`,
            },
            zIndex: 1100,
          }}
        >
          <KeyboardArrowUpIcon sx={{ fontSize: 28 }} />

        </Fab>
      </Zoom>
    </>
  );
}
