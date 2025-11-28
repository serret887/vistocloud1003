# Quick Start: Test & Deploy Firebase Functions

## 🧪 Local Testing (5 minutes)

### 1. Create `.env` file in `functions/` directory:

```bash
cd functions
cat > .env << 'EOF'
GOOGLE_AI_API_KEY=your-api-key-here
AI_PROVIDER=vertexExpress
AI_MODEL=gemini-1.5-flash
EOF
```

**Get API key:** https://aistudio.google.com/app/apikey

### 2. Build and test:

```bash
# Build functions
npm run build

# Start emulators (from project root)
npm run emulators:start

# In another terminal, start your app
npm run dev
```

### 3. Test in your app:
- Open your app in browser
- Use the voice dictation feature
- Check browser console for function calls
- Check emulator UI at http://localhost:4000

---

## 🚀 Production Deployment (10 minutes)

### 1. Set up secrets:

```bash
firebase functions:secrets:set GOOGLE_AI_API_KEY
# Paste your API key when prompted
```

### 2. Deploy:

```bash
# From project root
firebase deploy --only functions
```

### 3. Verify:

```bash
# Check logs
firebase functions:log

# List deployed functions
firebase functions:list
```

### 4. Test production:
- Update `.env` in project root: `VITE_USE_FIREBASE_EMULATOR=false`
- Restart your app
- Test voice dictation feature

---

## ✅ Checklist

**Before Testing:**
- [ ] `.env` file created in `functions/` with `GOOGLE_AI_API_KEY`
- [ ] Functions built (`npm run build` in `functions/`)
- [ ] Emulators running (`npm run emulators:start`)

**Before Deployment:**
- [ ] Secret set: `firebase functions:secrets:set GOOGLE_AI_API_KEY`
- [ ] Functions built without errors
- [ ] Firebase project selected: `firebase use` (should show `vistocloud`)

**After Deployment:**
- [ ] Functions appear in Firebase Console
- [ ] Logs show successful function calls
- [ ] App can call functions successfully

---

## 🐛 Common Issues

**"Functions not found"**
→ Make sure emulators are running: `lsof -ti:5001`

**"API key not set"**
→ Local: Check `functions/.env` exists
→ Production: Run `firebase functions:secrets:set GOOGLE_AI_API_KEY`

**"Build errors"**
→ Run `cd functions && npm run build` and fix TypeScript errors

**"Deployment failed"**
→ Check billing is enabled in Firebase Console
→ Verify you're logged in: `firebase login:list`

---

## 📚 Full Documentation

See `TESTING_AND_DEPLOYMENT.md` for detailed instructions.

