# 🎯 Quick Reference: Nginx Proxy Manager

## 📋 Default Credentials
- **URL**: http://YOUR_SERVER_IP:81
- **Email**: admin@example.com
- **Password**: changeme

⚠️ **Change immediately after first login!**

---

## 🌐 DNS Settings (at your domain registrar)

```
Type    Name    Value
A       @       YOUR_SERVER_IP
A       www     YOUR_SERVER_IP
A       api     YOUR_SERVER_IP (optional)
```

**Wait 15-60 minutes for DNS propagation**

---

## 🔧 Add Proxy Host for kontrollitud.ee

### Frontend (Main Website)
1. Go to **Proxy Hosts** → **Add Proxy Host**

**Details Tab:**
```
Domain Names: kontrollitud.ee, www.kontrollitud.ee
Scheme: http
Forward Hostname/IP: host.docker.internal (or 172.17.0.1)
Forward Port: 3000
☑ Block Common Exploits
☑ Websockets Support
```

**SSL Tab:**
```
☑ Request a new SSL Certificate
☑ Force SSL
☑ HTTP/2 Support
Email: your-email@example.com
☑ I Agree to the Let's Encrypt Terms of Service
```

### API Backend (Optional)
**Details Tab:**
```
Domain Names: api.kontrollitud.ee
Scheme: http
Forward Hostname/IP: host.docker.internal
Forward Port: 5000
☑ Block Common Exploits
```

**SSL Tab:**
```
☑ Request SSL Certificate
☑ Force SSL
```

---

## 🔍 Find Docker Host IP

If `host.docker.internal` doesn't work:

```bash
# Method 1: Docker bridge IP
docker network inspect bridge | grep Gateway

# Method 2: Container IP
docker inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' kontrollitudee-frontend-1

# Method 3: Server local IP
hostname -I | awk '{print $1}'
```

Common IPs:
- `172.17.0.1` (Docker default gateway)
- `host.docker.internal` (Docker Desktop)
- `192.168.x.x` (local network)

---

## ✅ Verification Checklist

- [ ] Nginx Proxy Manager running: `docker ps | grep nginx-proxy`
- [ ] Admin panel accessible: http://YOUR_IP:81
- [ ] Password changed from default
- [ ] DNS configured and propagated (use https://dnschecker.org)
- [ ] Proxy Host created for kontrollitud.ee
- [ ] SSL certificate issued (green lock in browser)
- [ ] HTTP redirects to HTTPS
- [ ] Site accessible: https://kontrollitud.ee
- [ ] Site accessible: https://www.kontrollitud.ee

---

## 🚨 Troubleshooting

### 502 Bad Gateway
```bash
# Check if containers are running
docker ps

# Check container connectivity
docker exec -it nginx-proxy-manager-app-1 ping host.docker.internal

# If ping fails, use container IP:
docker inspect kontrollitudee-frontend-1 | grep IPAddress
```

### SSL Certificate Error
```bash
# Check logs
cd ~/proxy
docker-compose logs -f app

# Ensure port 80 is open
sudo ufw allow 80/tcp

# Wait 5-10 minutes, DNS needs to propagate
```

### Can't Access Admin Panel
```bash
# Check if port 81 is open
sudo ufw allow 81/tcp

# Restart container
cd ~/proxy
docker-compose restart
```

---

## 🔐 Security Hardening (After Setup)

1. **Close Admin Panel Port:**
   ```bash
   sudo ufw delete allow 81/tcp
   ```
   Access via SSH tunnel:
   ```bash
   ssh -L 8081:localhost:81 user@YOUR_SERVER_IP
   # Then open: http://localhost:8081
   ```

2. **Use Strong Password:**
   - 16+ characters
   - Mix of letters, numbers, symbols

3. **Enable 2FA** (if available in future versions)

---

## 📞 Support

- Documentation: [NGINX_PROXY_SETUP.md](NGINX_PROXY_SETUP.md)
- Official Docs: https://nginxproxymanager.com/guide/
- GitHub: https://github.com/NginxProxyManager/nginx-proxy-manager

---

**Last Updated**: January 2, 2026
