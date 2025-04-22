class PopupManager {
    constructor() {
        this.overlay = document.getElementById('overlay');
        this.init();
    }

    init() {
        this.overlay.addEventListener('click', (event) => {
            if (event.target === this.overlay) {
                this.closeAll();
            }
        });

        document.querySelectorAll('[data-action="close-popup"]').forEach(element => {
            element.addEventListener('click', () => this.closeAll());
        });
    }

    openDeleteUserPopup(id, nom, prenom, image) {
        console.log(id, nom, prenom, image)
        document.getElementById('delete-user-popup').classList.remove('hidden');
        document.getElementById('picture-popup').src = `images/profil/${image}`;
        document.getElementById('user-name').textContent = `${prenom} ${nom}`;
        document.body.style.overflow = "hidden"

        const deleteButton = document.getElementById('confirm-delete');
        deleteButton.onclick = () => this.deleteUser(id);

        this.overlay.classList.remove('hidden');
    }

    closeAll() {
        this.overlay.classList.add('hidden');
        document.body.style.overflow = "scroll"


        document.querySelectorAll('.mini-popup, .popup').forEach(popup => {
            popup.classList.add('hidden');
        });
    }

    deleteUser(id) {
        fetch(`/admin/delete-user/${id}`, {
            method: 'DELETE',
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const userCard = document.getElementById(`user-${id}`);
                    if (userCard) {
                        userCard.remove();
                    }
                    this.closeAll();
                } else {
                    alert('Erreur lors de la suppression');
                }
            })
            .catch(error => {
                console.error('Erreur:', error);
                alert('Erreur lors de la suppression');
            });
    }


    openAddPopupUser(){
        document.getElementById('add-user-popup').classList.remove('hidden');
        document.body.style.overflow = "hidden"
        this.overlay.classList.remove('hidden');

    }
}



document.addEventListener('DOMContentLoaded', () => {
    window.popupManager = new PopupManager();
})


// ELEMENT VISUEL DANS LES POPUP MAJORITAIREMENT DRAG AND DROP ET MULTI SELECT

// Ce fichier c'est esstentiellement pour la gestion des évènements visuels, en soit c'est des composants dans la popup
function dropZoneLoaded() {
    document.querySelectorAll(".drop-zone__input").forEach((inputElement) => {
        const dropZoneElement = inputElement.closest(".drop-zone");

        dropZoneElement.addEventListener("click", (e) => {
            inputElement.click();
        });

        inputElement.addEventListener("change", (e) => {
            if (inputElement.files.length) {
                updateThumbnail(dropZoneElement, inputElement.files[0]);
            }
        });

        dropZoneElement.addEventListener("dragover", (e) => {
            e.preventDefault();
            dropZoneElement.classList.add("drop-zone--over");
        });

        ["dragleave", "dragend"].forEach((type) => {
            dropZoneElement.addEventListener(type, (e) => {
                dropZoneElement.classList.remove("drop-zone--over");
            });
        });

        dropZoneElement.addEventListener("drop", (e) => {
            e.preventDefault();

            if (e.dataTransfer.files.length) {
                inputElement.files = e.dataTransfer.files;
                updateThumbnail(dropZoneElement, e.dataTransfer.files[0]);
            }

            dropZoneElement.classList.remove("drop-zone--over");
        });
    });

    /**
     * Updates the thumbnail on a drop zone element.
     *
     * @param {HTMLElement} dropZoneElement
     * @param {File} file
     */
    function updateThumbnail(dropZoneElement, file) {
        let thumbnailElement = dropZoneElement.querySelector(".drop-zone__thumb");

        // First time - remove the prompt
        if (dropZoneElement.querySelector(".drop-zone__prompt")) {
            dropZoneElement.querySelector(".drop-zone__prompt").remove();
            dropZoneElement.querySelector("div.separator").remove();
            dropZoneElement.querySelector("div.fake-button").remove();
        }

        // First time - there is no thumbnail element, so lets create it
        if (!thumbnailElement) {
            thumbnailElement = document.createElement("div");
            thumbnailElement.classList.add("drop-zone__thumb");
            dropZoneElement.appendChild(thumbnailElement);
        }

        thumbnailElement.dataset.label = file.name;

        // Show thumbnail for image files
        if (file.type.startsWith("image/")) {
            const reader = new FileReader();

            reader.readAsDataURL(file);
            reader.onload = () => {
                thumbnailElement.style.backgroundImage = `url('${reader.result}')`;
                document.getElementById('prev-picture').src = reader.result;
            };
        } else {
            thumbnailElement.style.backgroundImage = null;
        }
    }

}

function changeFirstName(prenom){
    let result = prenom;
    if(result === ""){
        result = "[Prénom]"
    }
    document.getElementById('prev-firstname-section').innerHTML = `<strong>${result}</strong>`;

}


// Penser à gerer la taille
function changeLastName(nom){
    let result = nom;
    if(result === ""){
        result = "[Nom de famille]"
    }
    document.getElementById('prev-name-section').innerHTML = `<strong>${result}</strong>`;

}

function changeMail(mail){
    let result = mail;
    if(result === ""){
        result = "adresse@mail.com";
    }
    document.getElementById('prev-mail-section').innerHTML = `${result}`;

}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('nom').addEventListener('keyup', (event) =>{
        changeLastName(event.target.value)
    })

    document.getElementById('prenom').addEventListener('keyup', () =>{
        changeFirstName(event.target.value)

    })

    document.getElementById('email').addEventListener('keyup', () =>{
        changeMail(document.getElementById('email').value)

    })

    dropZoneLoaded()
})


/* MULTISELECT */

document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('click', closeDropdownOutside);
})

function toggleDropdown() {
    const select = document.getElementById('ue-select');
    const container = document.getElementById('option-container');

    select.classList.toggle('open');

    if (select.classList.contains('open')) {
        container.classList.remove('hidden');
        // document.getElementById('option-filter').focus(); // Optionnel si besoin focus input
        document.addEventListener('click', closeDropdownOutside);
    } else {
        container.classList.add('hidden');
        document.removeEventListener('click', closeDropdownOutside);
    }
}

function closeDropdownOutside(event) {
    const select = document.getElementById('ue-select');
    const container = document.getElementById('option-container');

    if (!select.contains(event.target)) {
        select.classList.remove('open');
        container.classList.add('hidden');
        document.removeEventListener('click', closeDropdownOutside);
    }
}


function filterOptions() {
    const filterValue = document.getElementById('option-filter').value.toLowerCase();
    const options = document.querySelectorAll('#options-list .option');

    options.forEach(option => {
        const text = option.textContent.toLowerCase();
        if (text.includes(filterValue)) {
            option.classList.remove('hidden');
        } else {
            option.classList.add('hidden');
        }
    });
}

function toggleOption(el) {
    el.classList.toggle('selected');

    const selectedContainer = document.getElementById('selected-options');
    const value = el.dataset.value;

    if (el.classList.contains('selected')) {
        const tag = document.createElement('span');
        tag.className = 'tag';
        tag.dataset.value = value;
        tag.innerHTML = `<i class="fa fa-code"></i> ${value} <span onclick="removeTag('${value}', event)">✖</span>`;
        selectedContainer.appendChild(tag);
    } else {
        document.querySelector(`.tag[data-value="${value}"]`)?.remove();
    }

    updateHiddenInput();
    updatePreviewUEList();
}

function removeTag(value, event) {
    if (event) {
        event.stopPropagation(); // Si je fais pas ça quand je selectionne une UE le menu se feme
    }
    document.querySelector(`.option[data-value="${value}"]`)?.classList.remove('selected');
    document.querySelector(`.tag[data-value="${value}"]`)?.remove();
    updateHiddenInput();
    updatePreviewUEList();
}

function updateHiddenInput() {
    const tags = document.querySelectorAll('.selected-options .tag');
    const values = Array.from(tags).map(t => t.dataset.value);
    document.getElementById('ue-input').value = values.join(',');
}

function updatePreviewUEList() {
    const selectedUE = document.querySelectorAll('.selected-options .tag');
    const ListUe = document.getElementById('prev-ue');

    if (ListUe) {
        ListUe.innerHTML = ''; // On vide d'abord
    }

    if (selectedUE.length > 0) {
        selectedUE.forEach(tag => {
            const wrapperDiv = document.createElement('div');
            wrapperDiv.classList.add('ue-item');

            const icon = document.createElement('i');
            icon.classList.add('fa', 'fa-square-root-variable');

            const text = document.createElement('span');
            text.textContent = tag.dataset.value;

            wrapperDiv.appendChild(icon);
            wrapperDiv.appendChild(text);

            ListUe.appendChild(wrapperDiv);
        });
    }
}
