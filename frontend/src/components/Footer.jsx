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
                      color: "text.secondary",
                      fontWeight: 500,
                      transition: "color 0.2s",
                      "&:hover": { color: "primary.main" },
                    }}
                  >
                    {link.name}
                  </Link>
                ))}
              </Box>
            </Grid>
          ))}
        </Grid>

        <Divider sx={{ my: 6, borderColor: "divider" }} />

        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            justifyContent: "space-between",
            alignItems: "center",
            gap: 2,
          }}
        >
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
  );
}
