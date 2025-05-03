document.addEventListener('DOMContentLoaded', () => {
    // On écoute les clics en dehors des menus déroulants pour les fermer
    document.addEventListener('click', closeDropdownOutside);
})

/**
 * Ouvre ou ferme un menu déroulant selon son type (UE ou utilisateur)
 * @param {string} type - 'ue' pour le menu UE, autre pour le menu utilisateur
 */
function toggleDropdown(type) {
    // On détermine les IDs des éléments en fonction du type
    const selectId = type === 'ue' ? 'ue-ue-select' : 'user-ue-select';
    const containerId = type === 'ue' ? 'ue-option-container' : 'user-option-container';

    const select = document.getElementById(selectId);
    const container = document.getElementById(containerId);

    // Si les éléments n'existent pas, on ne fait rien
    if (!select || !container) return;

    // On bascule l'état ouvert/fermé
    select.classList.toggle('open');
    // Si on ouvre, on affiche les options et on écoute les clics extérieurs
    if (select.classList.contains('open')) {
        container.classList.remove('hidden');
        document.addEventListener('click', closeDropdownOutside);
    } else {
        // Si on ferme, on cache juste les options
        container.classList.add('hidden');
    }
}

/**
 * Ferme les menus déroulants si on clique en dehors
 * @param {Event} event - L'événement de clic
 */
function closeDropdownOutside(event) {
    // Récupération des éléments du menu UE
    const selectUE = document.getElementById('ue-ue-select');
    const containerUE = document.getElementById('ue-option-container');

    // Récupération des éléments du menu utilisateur
    const selectUser = document.getElementById('user-ue-select');
    const containerUser = document.getElementById('user-option-container');

    // Fermeture du menu UE si on clique ailleurs
    if (selectUE && containerUE && selectUE.classList.contains('open')) {
        if (!selectUE.contains(event.target)) {
            console.log('Fermeture du sélecteur UE');
            selectUE.classList.remove('open');
            containerUE.classList.add('hidden');
        }
    }

    // Fermeture du menu utilisateur si on clique ailleurs
    if (selectUser && containerUser && selectUser.classList.contains('open')) {
        if (!selectUser.contains(event.target)) {
            console.log('Fermeture du sélecteur User');
            selectUser.classList.remove('open');
            containerUser.classList.add('hidden');
        }
    }

    // Si aucun menu n'est ouvert, on supprime l'écouteur pour optimiser les performances
    const anyOpenSelector =
        (selectUE && selectUE.classList.contains('open')) ||
        (selectUser && selectUser.classList.contains('open'));

    if (!anyOpenSelector) {
        document.removeEventListener('click', closeDropdownOutside);
        console.log('Écouteur d\'événement supprimé');
    }
}



/**
 * Filtre les options d'un menu déroulant selon la saisie utilisateur
 * @param {string} pref - Préfixe identifiant le menu ('ue' ou 'user')
 */
function filterOptions(pref) {
    // On récupère la valeur du champ de filtre
    const filterValue = document.getElementById(pref + '-option-filter').value.toLowerCase();

    // On parcourt toutes les options pour les afficher/masquer selon le filtre
    const options = document.querySelectorAll(`#${pref}-options-list .option`);

    options.forEach(option => {
        const text = option.textContent.toLowerCase();
        if (text.includes(filterValue)) {
            option.classList.remove('hidden');
        } else {
            option.classList.add('hidden');
        }
    });
}

/**
 * Sélectionne/désélectionne une option et met à jour l'affichage
 * @param {HTMLElement} el - L'élément option cliqué
 * @param {string} pref - Préfixe identifiant le menu
 */
function toggleOption(el, pref) {
    el.classList.toggle('selected');

    const selectedContainer = document.getElementById(pref + '-selected-options');
    const value = el.dataset.value;


    if (el.classList.contains('selected')) {
        // Si l'option est sélectionnée, on crée un tag correspondan
        const tag = document.createElement('span');
        tag.className = 'tag';
        tag.dataset.value = value;
        tag.dataset.nom = el.getAttribute('data-nom');
        tag.innerHTML = `<i class="fa fa-code"></i> ${el.getAttribute('data-nom')} <span onclick="removeTag('${value}', event, '${pref}')">✖</span>`;
        selectedContainer.appendChild(tag);
    } else {
        // Sinon on supprime le tag correspondant
        document.querySelector(`.tag[data-value="${value}"]`)?.remove();
    }

    // Mise à jour des champs cachés et de la prévisualisation
    updateHiddenInput(pref);
    updatePreviewUEList(pref);
}

/**
 * Supprime un tag et désélectionne l'option correspondante
 * @param {string} value - Valeur de l'option à supprimer
 * @param {Event} event - Événement de clic
 * @param {string} pref - Préfixe identifiant le menu
 */
function removeTag(value, event, pref) {
    // On empêche la propagation pour ne pas fermer le menu
    if (event) {
        event.stopPropagation(); // Si je fais pas ça quand je selectionne une UE le menu se feme
    }

    // On désélectionne l'option et on supprime le tag
    document.querySelector(`.option[data-value="${value}"]`)?.classList.remove('selected');
    document.querySelector(`.tag[data-value="${value}"]`)?.remove();

    // Mise à jour des champs cachés et de la prévisualisation
    updateHiddenInput(pref);
    updatePreviewUEList(pref);
}

/**
 * Met à jour le champ input caché avec les valeurs sélectionnées
 * @param {string} pref - Préfixe identifiant le menu
 */
function updateHiddenInput(pref) {
    const tags = document.querySelectorAll('.selected-options .tag');
    const values = Array.from(tags).map(t => t.dataset.value);
    document.getElementById(pref + '-ue-input').value = values.join(',');
}


/**
 * Met à jour la liste de prévisualisation des UE sélectionnées
 * @param {string} pref - Préfixe identifiant le menu
 */
function updatePreviewUEList(pref) {
    const selectedUE = document.querySelectorAll('.selected-options .tag');
    const ListUe = document.getElementById(pref + '-prev-ue');

    // On vide d'abord la liste
    if (ListUe) {
        ListUe.innerHTML = ''; // On vide d'abord
    }

    // Si des UE sont sélectionnées, on les ajoute à la prévisualisation
    if (selectedUE.length > 0) {
        selectedUE.forEach(tag => {
            const wrapperDiv = document.createElement('div');
            wrapperDiv.classList.add('ue-item');

            // Icône différente selon le type de menu
            const icon = document.createElement('i');
            let icons = pref === 'user' ? 'fa-square-root-variable' : 'fa-user'
            icon.classList.add('fa', icons);

            const text = document.createElement('span');

            //text.textContent = tag.dataset.value;
            text.textContent = pref !== 'ue' ? tag.dataset.value : tag.dataset.nom;

            // Bouton de suppression
            const span = document.createElement('span')
            span.textContent = '✖';
            span.className = 'hover-effect';
            span.onclick = (e) => removeTag(tag.dataset.value, e, pref);

            wrapperDiv.appendChild(icon);
            wrapperDiv.appendChild(text);
            wrapperDiv.appendChild(span)

            ListUe.appendChild(wrapperDiv);
        });
    }
}



