# Decap CMS (Netlify CMS) Setup Instructions

1. Go to https://app.netlify.com and log in or sign up.
2. Create a new site from your GitHub repository (choose your portfolio repo).
3. In Site Settings > Identity, enable Identity and Git Gateway.
   - Enable registration (invite yourself as an admin).
   - Enable Git Gateway (for CMS login).
4. In Site Settings > Identity > Services > Git Gateway, click "Enable Git Gateway".
5. Visit `/admin` on your Netlify site (e.g., `https://yoursite.netlify.app/admin`) to log in and manage blog posts.
6. You can continue to host your site on GitHub Pages with your custom domain (`khagendraneupane.com.np`). Netlify is only used for CMS login and content management.
7. Any changes made via the CMS will be committed to your GitHub repo automatically.

**Note:**
- You do NOT need to change your main site hosting. Just use Netlify for CMS and Git Gateway.
- For more info, see https://decapcms.org/docs/add-to-your-site/
