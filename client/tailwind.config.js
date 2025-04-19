module.exports = {
  theme: {
    extend: {
      animation: {
        'spin-slow': 'spin 8s linear infinite',
        'spin-reverse': 'spin-reverse 6s linear infinite',
        'bounce-gentle': 'bounce-gentle 3s ease-in-out infinite',
        'fadeIn': 'fadeIn 0.5s ease-in',
        'dash': 'dash 2s ease-in-out infinite',
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        'spin-reverse': {
          'to': { transform: 'rotate(-360deg)' }
        },
        'bounce-gentle': {
          '0%, 100%': { transform: 'translateY(-5%)' },
          '50%': { transform: 'translateY(5%)' }
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        dash: {
          '0%': { strokeDasharray: '0,100' },
          '100%': { strokeDasharray: '100,100' }
        }
      }
    }
  }
};