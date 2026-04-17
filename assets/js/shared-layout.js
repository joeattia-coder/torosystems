(function () {
  var serviceNavItems = {
    services: true,
    alarm: true,
    surveillance: true,
    dooraccess: true,
    accessibility: true
  };

  function applyActiveNav() {
    var currentNav = document.body.getAttribute('data-nav');
    var headerElement = document.querySelector('header');
    var navItems;
    var activeItem;
    var servicesItem;

    if (!headerElement || !currentNav) {
      return;
    }

    navItems = headerElement.querySelectorAll('[data-nav-item]');

    navItems.forEach(function (item) {
      item.classList.remove('active');
    });

    activeItem = headerElement.querySelector('[data-nav-item="' + currentNav + '"]');
    servicesItem = headerElement.querySelector('[data-nav-item="services"]');

    if (activeItem) {
      activeItem.classList.add('active');
    }

    if (servicesItem && serviceNavItems[currentNav]) {
      servicesItem.classList.add('active');
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    applyActiveNav();
  });
}());