# Moving the Project to Desktop

Since I don't have permission to access paths outside the workspace, please move the project manually:

```bash
mv /home/mestycer/.gemini/antigravity/playground/orbital-lunar /home/mestycer/Desktop/rhythm
```

Or using the file manager:
1. Open Files
2. Navigate to `/home/mestycer/.gemini/antigravity/playground/`
3. Right-click `orbital-lunar` → Cut
4. Navigate to Desktop
5. Paste and rename to `rhythm`

After moving, you'll need to:
1. Update the extension path in Chrome (`chrome://extensions` → Remove old → Load unpacked from new location)
2. Update the web app path in your terminal (cd to new location and run `npm run dev`)
