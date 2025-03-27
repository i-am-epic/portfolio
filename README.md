# Bento Portfolio

A modern, customizable portfolio website built with React, Next.js, and SCSS. Features a beautiful bento grid layout that's fully responsive and .
# Website
https://nikboson.vercel.app

## Features

- Clean and modern design with bento grid layout
- Fully responsive for all screen sizes
- Dark mode support
- Simple and modular component structure
- Easy to customize with SCSS variables
- Built with React and Next.js
- No external UI libraries - pure React components

## Project Structure

```
src/
├── components/          # React components
│   ├── BentoGrid.tsx   # Main grid layout component
│   ├── BentoGridItem.tsx # Individual grid items
│   ├── Header.tsx      # Navigation header
│   └── ...
├── styles/
│   ├── base.scss       # Global styles and variables
│   └── components/     # Component-specific styles
│       ├── BentoGrid.scss
│       ├── BentoGridItem.scss
│       └── ...
└── pages/              # Next.js pages
    ├── index.tsx       # Home page
    ├── works.tsx       # Portfolio works page
    └── contact.tsx     # Contact page
```

## Customization

### Colors and Theme

Edit `src/styles/base.scss` to customize:
- Color scheme
- Typography
- Dark mode colors
- Global styles

### Components

Each component has its own SCSS file in `src/styles/components/`. Customize individual components by editing their respective style files.

### Content

Update the content by modifying the components in `src/components/`. Each component is self-contained and easy to customize.

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/bento-portfolio.git
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) to view your portfolio.

## Building for Production

```bash
npm run build
npm start
```

## Contributing

Feel free to submit issues and enhancement requests!

## License

MIT License - feel free to use this project for your own portfolio! 