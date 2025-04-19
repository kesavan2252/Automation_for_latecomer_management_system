module.exports = {
  // ... other config
  extend: {
    animation: {
      'fadeIn': 'fadeIn 0.5s ease-in',
    },
    keyframes: {
      fadeIn: {
        '0%': { opacity: '0', transform: 'translateY(10px)' },
        '100%': { opacity: '1', transform: 'translateY(0)' },
      },
    },
  },
  // ... other config
}