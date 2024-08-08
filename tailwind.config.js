/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./**/*.{html,js}"],
  theme: {
    extend: {
      fontFamily: {
        'display': ['Cabinet Grotesk']
      }
    },
  },
  plugins: [
    require('daisyui'),
  ],
  daisyui: {
    themes: [
      "forest",
      "dark",
      {
        masjid: {
          
        "primary": "#6ee7b7",
                  
        "secondary": "#5eead4",
                  
        "accent": "#bbf7d0",
                  
        "neutral": "#d1fae5",
                  
        "base-100": "#f3f4f6",
                  
        "info": "#fcd34d",
                  
        "success": "#22c55e",
                  
        "warning": "#facc15",
                  
        "error": "#ef4444",
                  },
      }
    ]
  }
}

