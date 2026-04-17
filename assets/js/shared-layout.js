(function () {
  var serviceNavItems = {
    services: true,
    alarm: true,
    surveillance: true,
    dooraccess: true,
    accessibility: true
  };

  function getPathPrefix() {
    var path = window.location.pathname.replace(/\\/g, '/');

    if (/\/Temp\//i.test(path)) {
      return '../';
    }

    return '';
  }

  function buildHeaderHtml(prefix) {
    return [
      '<div class="navbar navbar-fixed-top">',
      '  <div class="navbar-inner">',
      '    <div class="container-fluid" style="background-color:whitesmoke;">',
      '      <div class="container">',
      '        <div class="navbar-text">',
      '          <div class="pull-left">',
      '            <p style="margin: 0;">',
      '              <a style="text-decoration: none;" href="https://www.facebook.com/toroitservices/" title="Facebook"><i class="icon-rounded icon-32 icon-facebook"></i></a>',
      '              <a style="text-decoration: none;" href="https://www.linkedin.com/company/torosystems" title="LinkedIn"><i class="icon-rounded icon-32 icon-linkedin"></i></a>',
      '              <a style="text-decoration: none;" href="https://twitter.com/ToroSystems" title="Twitter"><i class="icon-rounded icon-32 icon-twitter"></i></a>',
      '            </p>',
      '          </div>',
      '          <div class="pull-right">',
      '            <p style="margin-bottom: 0;">',
      '              <i class="icon-phone icon-white" style="color:#bf0707;"></i>',
      '              <strong>647 274 7678</strong>',
      '            </p>',
      '          </div>',
      '        </div>',
      '      </div>',
      '    </div>',
      '    <div class="container">',
      '      <a class="brand logo" href="' + prefix + 'index.html" alt="Toro Systems">',
      '        <img src="' + prefix + 'assets/img/logo.png" alt="Toro Systems">',
      '      </a>',
      '      <div class="navigation">',
      '        <nav>',
      '          <ul class="nav topnav">',
      '            <li data-nav-item="home"><a href="' + prefix + 'index.html" alt="Home">Home</a></li>',
      '            <li data-nav-item="about"><a href="' + prefix + 'about.html" alt="About">About</a></li>',
      '            <li class="dropdown" data-nav-item="services">',
      '              <a href="' + prefix + 'services.html" alt="Services">Services</a>',
      '              <ul class="dropdown-menu">',
      '                <li data-nav-item="alarm"><a href="' + prefix + 'alarm.html" alt="Alarm Systems">Alarm Systems</a></li>',
      '                <li data-nav-item="surveillance"><a href="' + prefix + 'surveillance.html" alt="CCTV Surveillance">CCTV Surveillance</a></li>',
      '                <li data-nav-item="dooraccess"><a href="' + prefix + 'dooraccess.html" alt="Access Control Systems">Access Control</a></li>',
      '                <li data-nav-item="accessibility"><a href="' + prefix + 'accessibility.html" alt="Barrier-Free Accessibility">Accessibility</a></li>',
      '              </ul>',
      '            </li>',
      '            <li data-nav-item="areas"><a href="' + prefix + 'areas.html" alt="Areas We Serve">Areas</a></li>',
      '            <li data-nav-item="contact"><a href="' + prefix + 'contact.html" alt="Contact Us">Contact</a></li>',
      '          </ul>',
      '        </nav>',
      '      </div>',
      '    </div>',
      '  </div>',
      '</div>'
    ].join('');
  }

  function buildFooterHtml() {
    return [
      '<div class="verybottom">',
      '  <div class="container">',
      '    <div class="row">',
      '      <div class="span6">',
      '        <p>&copy; Toro Systems - All rights reserved</p>',
      '      </div>',
      '    </div>',
      '  </div>',
      '</div>'
    ].join('');
  }

  function ensureSharedChrome() {
    var headerElement = document.querySelector('header');
    var footerElement = document.querySelector('footer.footer');
    var prefix = getPathPrefix();

    if (headerElement && !headerElement.querySelector('.navbar')) {
      headerElement.innerHTML = buildHeaderHtml(prefix);
    }

    if (footerElement && !footerElement.querySelector('.verybottom')) {
      footerElement.innerHTML = buildFooterHtml();
    }
  }

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
    ensureSharedChrome();
    applyActiveNav();
  });
}());