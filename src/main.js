if (process.env.NODE_ENV === 'development') {
  import('./main.dev.css');
} else {
  import('./main.prod.css');
}