import { Box, Container, Grid, Typography, Link, IconButton, Divider } from "@mui/material";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import InstagramIcon from "@mui/icons-material/Instagram";
import logo from "../assets/logo.png";
import { useNavigate } from "react-router-dom";

export default function Footer() {
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    Company: [
      { name: "About Us", link: "/about" },
      { name: "Contact Us", link: "/contact" },
      { name: "Careers", link: "/careers" },
    ],
    Legal: [
      { name: "Terms of Service", link: "/terms" },
      { name: "Privacy Policy", link: "/privacy" },
      { name: "Cookie Policy", link: "/cookies" },
    ],
    Help: [
      { name: "Support Center", link: "/support" },
      { name: "Safety Tips", link: "/safety" },
      { name: "FAQs", link: "/faqs" },
    ],
  };

  return (
    <Box
      component="footer"
      sx={{
        bgcolor: "#ffffff",
        borderTop: "1px solid #e2e8f0",
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
                <Typography variant="h6" sx={{ fontWeight: 800, color: "#0f172a", lineHeight: 1 }}>
                  UniTrade
                </Typography>
                <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600 }}>
                  Campus Marketplace
                </Typography>
              </Box>
            </Box>
            <Typography sx={{ color: "#64748b", mb: 4, maxWidth: 300, lineHeight: 1.7 }}>
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
                  aria-label={social.label}
                  sx={{
                    bgcolor: "#f1f5f9",
                    color: "#475569",
                    "&:hover": {
                      bgcolor: "#2563eb",
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
                sx={{ fontWeight: 800, color: "#0f172a", mb: 3 }}
              >
                {category}
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {links.map((link) => (
                  <Link
                    key={link.name}
                    href="#"
                    underline="none"
                    sx={{
                      color: "#64748b",
                      fontWeight: 500,
                      transition: "color 0.2s",
                      "&:hover": { color: "#2563eb" },
                    }}
                  >
                    {link.name}
                  </Link>
                ))}
              </Box>
            </Grid>
          ))}
        </Grid>

        <Divider sx={{ my: 6, borderColor: "#f1f5f9" }} />

        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Typography variant="body2" sx={{ color: "#94a3b8", fontWeight: 500 }}>
            © {currentYear} UniTrade Egypt. All rights reserved. Built with ❤️ for Students.
          </Typography>
          <Box sx={{ display: "flex", gap: 4 }}>
            <Link href="#" underline="none" sx={{ color: "#94a3b8", fontSize: "0.875rem", "&:hover": { color: "#64748b" } }}>
              Privacy
            </Link>
            <Link href="#" underline="none" sx={{ color: "#94a3b8", fontSize: "0.875rem", "&:hover": { color: "#64748b" } }}>
              Terms
            </Link>
            <Link href="#" underline="none" sx={{ color: "#94a3b8", fontSize: "0.875rem", "&:hover": { color: "#64748b" } }}>
              Cookies
            </Link>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
