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
const DARK_BG = "linear-gradient(175deg, #0f172a 0%, #1e293b 100%)";
const ACCENT = "#3b82f6";
const ACCENT_HOVER = "#60a5fa";
const TEXT_PRIMARY = "#f1f5f9";
const TEXT_SECONDARY = "#94a3b8";
const TEXT_MUTED = "#64748b";
const DIVIDER_COLOR = "rgba(148,163,184,0.12)";

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
  { icon: <WhatsAppIcon />, label: "WhatsApp", color: "#25D366", href: "https://wa.me/201234567890" },
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
  { icon: <EmailOutlinedIcon sx={{ fontSize: 20 }} />, text: "support@unitrade.eg", href: "mailto:support@unitrade.eg" },
  { icon: <PhoneOutlinedIcon sx={{ fontSize: 20 }} />, text: "+20 123 456 7890", href: "tel:+201234567890" },
  { icon: <LocationOnOutlinedIcon sx={{ fontSize: 20 }} />, text: "Cairo, Egypt", href: null },
];

export default function Footer() {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();
  const [showBackToTop, setShowBackToTop] = useState(false);

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
<<<<<<< Updated upstream
    <Box
      component="footer"
      sx={{
        bgcolor: "background.paper",
        borderTop: "1px solid",
        borderColor: "divider",
        pt: 8,
        pb: 4,
        mt: "auto",
      }}
    >
      <Container maxWidth="xl">
        <Grid container spacing={6}>
          {/* Logo & Social Section */}
          <Grid item xs={12} md={4}>
            <Box
              onClick={() => navigate("/home")}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                mb: 3,
                cursor: "pointer",
                width: "fit-content",
              }}
            >
              <img src={logo} alt="UniTrade Logo" style={{ height: 45 }} />
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: "text.primary", lineHeight: 1 }}>
                  UniTrade
                </Typography>
                <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
                  Campus Marketplace
                </Typography>
              </Box>
            </Box>
            <Typography sx={{ color: "text.secondary", mb: 4, maxWidth: 300, lineHeight: 1.7 }}>
              The most trusted marketplace for university students across Egypt. Buy, sell, and trade with your peers safely and easily.
            </Typography>
            <Box sx={{ display: "flex", gap: 1.5 }}>
              {[
                { icon: <FacebookIcon />, label: "Facebook" },
                { icon: <TwitterIcon />, label: "Twitter" },
                { icon: <LinkedInIcon />, label: "LinkedIn" },
                { icon: <InstagramIcon />, label: "Instagram" },
              ].map((social) => (
                <IconButton
                  key={social.label}
                  size="small"
                  sx={{
                    bgcolor: "background.subtle",
                    color: "text.secondary",
                    "&:hover": {
                      bgcolor: "primary.main",
                      color: "#ffffff",
                      transform: "translateY(-2px)",
                    },
                    transition: "all 0.2s ease",
                  }}
                >
                  {social.icon}
                </IconButton>
              ))}
            </Box>
          </Grid>

          {/* Links Sections */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <Grid item xs={6} sm={4} md={2.66} key={category}>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 800, color: "text.primary", mb: 3 }}
=======
    <>
      <Box
        component="footer"
        sx={{
          background: DARK_BG,
          pt: { xs: 6, md: 8 },
          pb: 0,
          mt: "auto",
          position: "relative",
          overflow: "hidden",
          /* Decorative glow */
          "&::before": {
            content: '""',
            position: "absolute",
            top: -160,
            right: -80,
            width: 380,
            height: 380,
            borderRadius: "50%",
            background: `radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)`,
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
>>>>>>> Stashed changes
              >
                <Box
                  component="img"
                  src={logo}
                  alt="UniTrade Logo"
                  sx={{
                    height: 46,
                    width: "auto",
                    filter: "drop-shadow(0 2px 8px rgba(59,130,246,0.3))",
                  }}
                />
                <Box>
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 800, color: TEXT_PRIMARY, lineHeight: 1, fontSize: "1.25rem" }}
                  >
                    UniTrade
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: ACCENT, fontWeight: 600, letterSpacing: "0.04em" }}
                  >
                    Campus Marketplace
                  </Typography>
                </Box>
              </Box>

              <Typography
                sx={{
                  color: TEXT_SECONDARY,
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
<<<<<<< Updated upstream
                      color: "text.secondary",
                      fontWeight: 500,
                      transition: "color 0.2s",
                      "&:hover": { color: "primary.main" },
=======
                      color: TEXT_MUTED,
                      border: `1px solid ${DIVIDER_COLOR}`,
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
>>>>>>> Stashed changes
                    }}
                  >
                    {s.icon}
                  </IconButton>
                ))}
              </Box>
            </Grid>

            {/* ════════════════════ QUICK LINKS ════════════════════ */}
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <Typography sx={sectionTitleSx}>Quick Links</Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1.5 }}>
                {quickLinks.map((link) => (
                  <Link
                    key={link.name}
                    underline="none"
                    sx={{ ...linkSx, cursor: "pointer" }}
                    onClick={() => navigate(link.path)}
                  >
                    <Box className="link-icon" sx={{ color: ACCENT, display: "flex", alignItems: "center", transition: "all 0.3s ease" }}>
                      {link.icon}
                    </Box>
                    {link.name}
                  </Link>
                ))}
              </Box>
            </Grid>

<<<<<<< Updated upstream
        <Divider sx={{ my: 6, borderColor: "divider" }} />
=======
            {/* ════════════════════ CONTACT ════════════════════ */}
            <Grid size={{ xs: 12, sm: 6, md: 4 }}>
              <Typography sx={sectionTitleSx}>Contact Us</Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1.5 }}>
                {contactInfo.map((item, idx) => (
                  <Box key={idx} sx={{ display: "flex", alignItems: "center" }}>
                    {item.href ? (
                      <Link
                        href={item.href}
                        underline="none"
                        sx={linkSx}
                      >
                        <Box className="link-icon" sx={{ color: ACCENT, display: "flex", alignItems: "center", transition: "all 0.3s ease" }}>
                          {item.icon}
                        </Box>
                        {item.text}
                      </Link>
                    ) : (
                      <Box sx={{ ...linkSx, cursor: "default", "&:hover": { color: TEXT_SECONDARY, transform: "none" } }}>
                        <Box sx={{ color: ACCENT, display: "flex", alignItems: "center" }}>
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
>>>>>>> Stashed changes

          {/* ════════════════════ DIVIDER ════════════════════ */}
          <Divider sx={{ borderColor: DIVIDER_COLOR, mt: { xs: 5, md: 6 }, mb: 0 }} />

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
                color: TEXT_MUTED,
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
                    color: TEXT_MUTED,
                    fontSize: "0.82rem",
                    fontWeight: 500,
                    transition: "color 0.25s",
                    "&:hover": { color: ACCENT_HOVER },
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
            background: `linear-gradient(135deg, ${ACCENT} 0%, #6366f1 100%)`,
            color: "#fff",
            boxShadow: "0 6px 24px rgba(59,130,246,0.35)",
            transition: "all 0.3s cubic-bezier(.4,0,.2,1)",
            "&:hover": {
              transform: "translateY(-3px)",
              boxShadow: "0 10px 32px rgba(59,130,246,0.45)",
              background: `linear-gradient(135deg, ${ACCENT_HOVER} 0%, #818cf8 100%)`,
            },
            zIndex: 1100,
          }}
        >
<<<<<<< Updated upstream
          <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 500 }}>
            © {currentYear} UniTrade Egypt. All rights reserved. Built with ❤️ for Students.
          </Typography>
          <Box sx={{ display: "flex", gap: 4 }}>
            <Link href="#" underline="none" sx={{ color: "text.secondary", fontSize: "0.875rem", "&:hover": { color: "text.primary" } }}>
              Privacy
            </Link>
            <Link href="#" underline="none" sx={{ color: "text.secondary", fontSize: "0.875rem", "&:hover": { color: "text.primary" } }}>
              Terms
            </Link>
            <Link href="#" underline="none" sx={{ color: "text.secondary", fontSize: "0.875rem", "&:hover": { color: "text.primary" } }}>
              Cookies
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
=======
          <KeyboardArrowUpIcon sx={{ fontSize: 28 }} />

        </Fab>
      </Zoom>
    </>
>>>>>>> Stashed changes
  );
}
