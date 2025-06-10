// ============================================
// MARIEMUR THEME - JavaScript Principal
// ============================================

class ThemeApp {
  constructor() {
    this.init();
  }

  init() {
    this.setupMobileMenu();
    this.setupCart();
    this.setupProductForms();
    this.setupScrollEffects();
  }

  // Menu mobile
  setupMobileMenu() {
    const menuToggle = document.querySelector('.menu-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');
    
    if (menuToggle && mobileMenu) {
      menuToggle.addEventListener('click', () => {
        mobileMenu.classList.toggle('active');
        menuToggle.classList.toggle('active');
      });
    }
  }

  // Gestion du panier
  setupCart() {
    document.addEventListener('click', (e) => {
      if (e.target.matches('[data-cart-add]')) {
        e.preventDefault();
        this.addToCart(e.target);
      }
    });
  }

  async addToCart(button) {
    const form = button.closest('form');
    const formData = new FormData(form);
    
    try {
      button.disabled = true;
      button.textContent = 'Ajout...';
      
      const response = await fetch('/cart/add.js', {
        method: 'POST',
        body: formData
      });
      
      if (response.ok) {
        const item = await response.json();
        this.updateCartCount();
        this.showCartNotification(item);
      }
    } catch (error) {
      console.error('Erreur ajout panier:', error);
    } finally {
      button.disabled = false;
      button.textContent = 'Ajouter au panier';
    }
  }

  async updateCartCount() {
    try {
      const response = await fetch('/cart.js');
      const cart = await response.json();
      
      const cartCountElements = document.querySelectorAll('.cart-count');
      cartCountElements.forEach(el => {
        el.textContent = cart.item_count;
        el.style.display = cart.item_count > 0 ? 'flex' : 'none';
      });
    } catch (error) {
      console.error('Erreur mise à jour panier:', error);
    }
  }

  showCartNotification(item) {
    // Créer une notification simple
    const notification = document.createElement('div');
    notification.className = 'cart-notification';
    notification.innerHTML = `
      <div class="cart-notification__content">
        <p>✓ Produit ajouté au panier</p>
        <a href="/cart" class="button button--secondary">Voir le panier</a>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Animation d'apparition
    setTimeout(() => notification.classList.add('active'), 100);
    
    // Suppression après 3 secondes
    setTimeout(() => {
      notification.classList.remove('active');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  // Formulaires produits
  setupProductForms() {
    const variantSelectors = document.querySelectorAll('[data-variant-selector]');
    
    variantSelectors.forEach(selector => {
      selector.addEventListener('change', (e) => {
        this.updateVariantInfo(e.target.closest('form'));
      });
    });
  }

  updateVariantInfo(form) {
    const selectedOptions = Array.from(form.querySelectorAll('[data-variant-selector]'))
      .map(select => select.value);
    
    const productData = JSON.parse(form.querySelector('[data-product-json]').textContent);
    const selectedVariant = productData.variants.find(variant => {
      return variant.options.every((option, index) => option === selectedOptions[index]);
    });

    if (selectedVariant) {
      // Mettre à jour le prix
      const priceElement = form.querySelector('.price');
      if (priceElement) {
        priceElement.innerHTML = this.formatPrice(selectedVariant.price);
      }

      // Mettre à jour la disponibilité
      const addButton = form.querySelector('[data-cart-add]');
      if (addButton) {
        addButton.disabled = !selectedVariant.available;
        addButton.textContent = selectedVariant.available ? 'Ajouter au panier' : 'Épuisé';
      }
    }
  }

  formatPrice(cents) {
    return (cents / 100).toFixed(2).replace('.', ',') + ' €';
  }

  // Effets de scroll
  setupScrollEffects() {
    const header = document.querySelector('.header-wrapper');
    let lastScrollY = window.scrollY;

    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      
      if (header) {
        if (scrollY > 100) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }
      }
      
      lastScrollY = scrollY;
    });

    // Animation des éléments au scroll
    this.setupScrollAnimations();
  }

  setupScrollAnimations() {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
        }
      });
    }, observerOptions);

    // Observer les cards produits
    document.querySelectorAll('.card, .section').forEach(el => {
      observer.observe(el);
    });
  }
}

// Initialisation quand le DOM est prêt
document.addEventListener('DOMContentLoaded', () => {
  new ThemeApp();
});

// CSS pour les animations
const animationStyles = `
  <style>
    .cart-notification {
      position: fixed;
      top: 20px;
      right: 20px;
      background: white;
      padding: 1rem;
      border-radius: 8px;
      box-shadow: var(--shadow-heavy);
      transform: translateX(100%);
      transition: transform 0.3s ease;
      z-index: 1000;
    }
    
    .cart-notification.active {
      transform: translateX(0);
    }
    
    .cart-notification__content {
      display: flex;
      align-items: center;
      gap: 1rem;
    }
    
    .header-wrapper.scrolled {
      background: rgba(255, 255, 255, 0.98);
      backdrop-filter: blur(20px);
    }
    
    .card {
      opacity: 0;
      transform: translateY(30px);
      transition: opacity 0.6s ease, transform 0.6s ease;
    }
    
    .card.animate-in {
      opacity: 1;
      transform: translateY(0);
    }
  </style>
`;

document.head.insertAdjacentHTML('beforeend', animationStyles);
