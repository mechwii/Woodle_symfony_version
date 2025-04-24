document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('click', closeDropdownOutside);
})

function toggleDropdown(type) {
    const selectId = type === 'ue' ? 'ue-ue-select' : 'user-ue-select';
    const containerId = type === 'ue' ? 'ue-option-container' : 'user-option-container';

    const select = document.getElementById(selectId);
    const container = document.getElementById(containerId);

    if (!select || !container) return;

    select.classList.toggle('open');

    if (select.classList.contains('open')) {
        container.classList.remove('hidden');
        document.addEventListener('click', closeDropdownOutside);
    } else {
        container.classList.add('hidden');
    }
}

function closeDropdownOutside(event) {
    // Sélecteurs pour l'UE
    const selectUE = document.getElementById('ue-ue-select');
    const containerUE = document.getElementById('ue-option-container');

    // Sélecteurs pour l'utilisateur
    const selectUser = document.getElementById('user-ue-select');
    const containerUser = document.getElementById('user-option-container');

    // Vérifier et fermer le sélecteur UE si nécessaire
    if (selectUE && containerUE && selectUE.classList.contains('open')) {
        if (!selectUE.contains(event.target)) {
            console.log('Fermeture du sélecteur UE');
            selectUE.classList.remove('open');
            containerUE.classList.add('hidden');
        }
    }

    // Vérifier et fermer le sélecteur User si nécessaire
    if (selectUser && containerUser && selectUser.classList.contains('open')) {
        if (!selectUser.contains(event.target)) {
            console.log('Fermeture du sélecteur User');
            selectUser.classList.remove('open');
            containerUser.classList.add('hidden');
        }
    }

    // Si aucun des sélecteurs n'est ouvert, retirer l'écouteur
    const anyOpenSelector =
        (selectUE && selectUE.classList.contains('open')) ||
        (selectUser && selectUser.classList.contains('open'));

    if (!anyOpenSelector) {
        document.removeEventListener('click', closeDropdownOutside);
        console.log('Écouteur d\'événement supprimé');
    }
}


function filterOptions(pref) {
    const filterValue = document.getElementById(pref + '-option-filter').value.toLowerCase();

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

function toggleOption(el, pref) {
    el.classList.toggle('selected');
    console.log(el.classList.nom + "    aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")

    const selectedContainer = document.getElementById(pref + '-selected-options');
    const value = el.dataset.value;
    console.log(selectedContainer.dataset.nom, el.getAttribute('data-nom'), value)

    if (el.classList.contains('selected')) {
        const tag = document.createElement('span');
        tag.className = 'tag';
        tag.dataset.value = value;
        tag.dataset.nom = el.getAttribute('data-nom');
        tag.innerHTML = `<i class="fa fa-code"></i> ${el.getAttribute('data-nom')} <span onclick="removeTag('${value}', event, '${pref}')">✖</span>`;
        selectedContainer.appendChild(tag);
    } else {
        document.querySelector(`.tag[data-value="${value}"]`)?.remove();
    }

    updateHiddenInput(pref);
    updatePreviewUEList(pref);
}

function removeTag(value, event, pref) {
    if (event) {
        event.stopPropagation(); // Si je fais pas ça quand je selectionne une UE le menu se feme
    }
    document.querySelector(`.option[data-value="${value}"]`)?.classList.remove('selected');
    document.querySelector(`.tag[data-value="${value}"]`)?.remove();
    updateHiddenInput(pref);
    updatePreviewUEList(pref);
}

function updateHiddenInput(pref) {
    const tags = document.querySelectorAll('.selected-options .tag');
    const values = Array.from(tags).map(t => t.dataset.value);
    document.getElementById(pref + '-ue-input').value = values.join(',');
}

function updatePreviewUEList(pref) {
    const selectedUE = document.querySelectorAll('.selected-options .tag');
    const ListUe = document.getElementById(pref + '-prev-ue');

    if (ListUe) {
        ListUe.innerHTML = ''; // On vide d'abord
    }

    if (selectedUE.length > 0) {
        selectedUE.forEach(tag => {
            const wrapperDiv = document.createElement('div');
            wrapperDiv.classList.add('ue-item');

            const icon = document.createElement('i');
            let icons = pref === 'user' ? 'fa-square-root-variable' : 'fa-user'
            icon.classList.add('fa', icons);

            const text = document.createElement('span');

            //text.textContent = tag.dataset.value;
            text.textContent = pref !== 'ue' ? tag.dataset.value : tag.dataset.nom;

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



