(() => {
  'use strict';

  const initContactForm = () => {
    const form = document.getElementById('miniContactForm');
    const feedbackEl = document.getElementById('miniContactFeedback');
    if (!form || !feedbackEl) return;

    const toWhatsapp = '573229520608';
    const waFallbackUrl = `https://wa.me/${toWhatsapp}?text=${encodeURIComponent(
      'Hola, quiero contarte algo desde tu portafolio.'
    )}`;
    form.setAttribute('action', 'https://formsubmit.co/zvzgmzq@gmail.com');
    form.setAttribute('method', 'POST');
    form.setAttribute('target', '_blank');

    const setFeedback = (message, variant = 'muted') => {
      const variantClasses = ['text-muted', 'text-danger', 'text-success'];
      feedbackEl.classList.remove(...variantClasses, 'd-none');
      feedbackEl.classList.add(`text-${variant}`);
      feedbackEl.textContent = message;
    };

    const fallbackToFormSubmit = () => {
      form.dataset.fallbackTriggered = 'true';
      setTimeout(() => {
        form.submit();
      }, 0);
    };

    const openWhatsApp = (url) => {
      const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
      if (newWindow && typeof newWindow.focus === 'function') newWindow.focus();
      return Boolean(newWindow);
    };

    const handleSendFailure = (message) => {
      openWhatsApp(waFallbackUrl);
      setFeedback(`${message} Usa el botón de WhatsApp o escribe al +57 322 952 0608.`, 'danger');
      fallbackToFormSubmit();
    };

    form.addEventListener('submit', (event) => {
      if (form.dataset.fallbackTriggered === 'true') {
        delete form.dataset.fallbackTriggered;
        return;
      }
      event.preventDefault();
      const formData = new FormData(form);
      const name = (formData.get('name') || '').toString().trim();
      const email = (formData.get('email') || '').toString().trim();
      const message = (formData.get('message') || '').toString().trim();

      if (!name || !email || !message) {
        setFeedback('Por favor completa nombre, email y mensaje.', 'danger');
        return;
      }

      const msg = `Hola, soy ${name}. Mi correo es ${email}. ${message}`;
      const waUrl = `https://wa.me/${toWhatsapp}?text=${encodeURIComponent(msg)}`;
      if (typeof fetch !== 'function') {
        handleSendFailure(
          'Tu navegador bloquea envíos automáticos. Se abrirá el formulario directo para continuar.'
        );
        return;
      }

      try {
        fetch('https://formsubmit.co/ajax/zvzgmzq@gmail.com', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
          },
          body: formData,
        })
          .then((response) => {
            if (!response.ok) {
              throw new Error('No se pudo enviar el mensaje');
            }
            return response.json();
          })
          .then(() => {
            const opened = openWhatsApp(waUrl);
            const successText = opened
              ? 'Gracias por escribir. Te responderé pronto; WhatsApp se abrió automáticamente para continuar la conversación.'
              : 'Gracias por escribir. Te responderé pronto. Usa el botón de WhatsApp o escribe al +57 322 952 0608 para continuar la charla.';
            setFeedback(successText, 'success');
            form.reset();
          })
          .catch(() => {
            handleSendFailure('No se pudo enviar el mensaje. Se abrirá el formulario directo para enviarlo.');
          });
      } catch (error) {
        handleSendFailure('Hubo un problema al iniciar el envío. Se abrirá el formulario directo para intentarlo.');
      }
    });
  };

  const initTooltips = () => {
    if (!window.bootstrap || !bootstrap.Tooltip) return;
    const tooltipTriggerList = Array.from(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.forEach((tooltipTriggerEl) => {
      new bootstrap.Tooltip(tooltipTriggerEl);
    });
  };

  const initAOS = () => {
    if (window.AOS) {
      AOS.init({
        duration: 600,
        once: true,
        easing: 'ease-out-quart',
      });
    }
  };

  const initGitHubFeed = () => {
    const user = 'GmzQzvZ';
    const summaryEl = document.getElementById('githubSummary');
    const reposEl = document.getElementById('githubRepos');
    const errorEl = document.getElementById('githubError');
    if (!summaryEl || !reposEl || !errorEl) return;

    const safeDate = (value) => {
      if (!value) return 'Fecha desconocida';
      try {
        return new Date(value).toLocaleDateString('es-CO', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        });
      } catch (error) {
        return 'Fecha desconocida';
      }
    };

    const setError = (message) => {
      errorEl.textContent = message;
      errorEl.classList.remove('d-none');
    };

    const createRepoCard = (repo) => {
      const col = document.createElement('div');
      col.className = 'col';
      const article = document.createElement('article');
      article.className = 'github-card';
      const title = document.createElement('h3');
      const link = document.createElement('a');
      link.href = repo.html_url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = repo.name;
      title.appendChild(link);
      const description = document.createElement('p');
      description.textContent = repo.description || 'Sin descripción disponible.';
      const meta = document.createElement('div');
      meta.className = 'github-card-meta';
      const language = document.createElement('span');
      language.textContent = repo.language || 'Multi-lenguaje';
      const stars = document.createElement('span');
      stars.textContent = `★ ${repo.stargazers_count}`;
      const updated = document.createElement('span');
      updated.textContent = `Actualizado ${safeDate(repo.updated_at)}`;
      meta.append(language, stars, updated);
      article.append(title, description, meta);
      col.appendChild(article);
      return col;
    };

    let profileData = null;
    let lastUpdatedOverride = null;

    const renderSummary = () => {
      if (!profileData) return;
      const dateLabel = lastUpdatedOverride || safeDate(profileData.updated_at);
      summaryEl.innerHTML = `
        <strong>${profileData.name || profileData.login}</strong> •
        ${profileData.public_repos} repositorios públicos •
        ${profileData.followers} seguidores.
        <br>
        Última actualización: ${dateLabel}.
      `;
    };

    fetch(`https://api.github.com/users/${user}`)
      .then((res) => {
        if (!res.ok) throw new Error('Perfil de GitHub no disponible');
        return res.json();
      })
      .then((profile) => {
        profileData = profile;
        renderSummary();
      })
      .catch((err) => {
        summaryEl.textContent = 'No se pudo cargar el resumen del perfil.';
        setError(err.message);
      });

    fetch(`https://api.github.com/users/${user}/repos?sort=updated&per_page=4`)
      .then((res) => {
        if (!res.ok) throw new Error('Repositorios no disponibles');
        return res.json();
      })
      .then((repos) => {
        if (!Array.isArray(repos) || repos.length === 0) {
          reposEl.innerHTML = '<p class="text-muted">No hay repositorios públicos recientes.</p>';
          return;
        }

        reposEl.innerHTML = '';
        repos.forEach((repo) => reposEl.appendChild(createRepoCard(repo)));
        const repoUpdates = repos
          .map((repo) => repo.updated_at)
          .filter(Boolean);
        if (repoUpdates.length > 0) {
          const latestRepoUpdate = repoUpdates.reduce((latest, current) => {
            const latestDate = new Date(latest);
            const currentDate = new Date(current);
            return currentDate > latestDate ? current : latest;
          }, repoUpdates[0]);
          lastUpdatedOverride = safeDate(latestRepoUpdate);
          renderSummary();
        }
      })
      .catch((err) => {
        reposEl.innerHTML = '<p class="text-muted">No se pudieron cargar los repositorios.</p>';
        setError(err.message);
      });
  };

  const updateDynamicMeta = () => {
    const yearEl = document.getElementById('currentYear');
    if (yearEl) {
      yearEl.textContent = new Date().getFullYear();
    }

    const ageEl = document.getElementById('currentAge');
    if (ageEl) {
      const birthYear = Number(ageEl.dataset.birthYear);
      const birthMonth = Number(ageEl.dataset.birthMonth || 0);
      const birthDay = Number(ageEl.dataset.birthDay || 1);
      if (Number.isFinite(birthYear)) {
        const today = new Date();
        let age = today.getFullYear() - birthYear;
        if (
          today.getMonth() < birthMonth ||
          (today.getMonth() === birthMonth && today.getDate() < birthDay)
        ) {
          age -= 1;
        }
        ageEl.textContent = age;
      }
    }
  };

  const ready = (callback) => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  };

  ready(() => {
    updateDynamicMeta();
    initContactForm();
    initTooltips();
    initAOS();
    initGitHubFeed();
  });
})();
