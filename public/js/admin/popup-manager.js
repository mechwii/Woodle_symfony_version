class PopupManager {

    constructor() {
        // On récupère l'overlay une seule fois au chargement, pratique pour éviter de le chercher 50 fois
        this.overlay = document.getElementById('overlay');
        this.popupCat = 1; // Catégorie active du popup (utile pour différencier entre popup utilisateur / UE)
        this.init();
    }

    init() {
        // Ferme le popup si on clique directement sur l'overlay (et pas sur un élément à l'intérieur)
        this.overlay.addEventListener('click', (event) => {
            if (event.target === this.overlay) {
                this.closeAll();

            }
        });

        // Attache l'action de fermeture à tous les boutons ayant l'attribut `data-action="close-popup"`
        document.querySelectorAll('[data-action="close-popup"]').forEach(element => {
            element.addEventListener('click', () => this.closeAll());
        });


    }

    /**
     * Ouverture de la popup de fermeture
     * @param id
     * @param nom
     * @param prenom
     * @param image
     */
    openDeleteUserPopup(id, nom, prenom, image) {
        // Affiche le popup de suppression d'utilisateur avec les infos remplies

        // On remplit les informations
        document.getElementById('delete-user-popup').classList.remove('hidden');
        document.getElementById('picture-popup').src = `images/profil/${image}`;
        document.getElementById('user-name').textContent = `${prenom} ${nom}`;

        document.body.style.overflow = "hidden"

        const deleteButton = document.getElementById('confirm-delete');
        // Gère la suppression au clic, au click on supprime un utilsiateur
        deleteButton.onclick = () => this.deleteUser(id);
        this.overlay.classList.remove('hidden');
    }


    /**
     * Fonction qui est appelé pour fermer toutes les popup et reinitialiser les listeneer
     */
    closeAll() {
        this.overlay.classList.add('hidden');
        document.body.style.overflow = "scroll"


        document.querySelectorAll('.mini-popup, .popup').forEach(popup => {
            popup.classList.add('hidden');
        });

        // Ici on réinitialise tous les champs
        this.resetAllForm()
    }

    /**
     * Fonction qui réinitialise tous les champs de la popup
     */
    resetAllForm(){
        if (this.popupCat === 1) {
            console.log('ouch1')

            // Réinitialisation les champs du formulaire utilisateur
            document.getElementById('utilisateur_nom').value = '';
            document.getElementById('utilisateur_prenom').value = '';
            document.getElementById('utilisateur_password').value = ''
            document.getElementById('utilisateur_email').value = '';

            // On décoche toutes les cases de rôle séléctionné
            document.querySelectorAll('#check-button input[type="checkbox"]').forEach(checkbox => {
                checkbox.checked = false;
            });


            // On désélectionne les options UE
            document.querySelectorAll('.option.selected').forEach(opt => {
                opt.classList.remove('selected');
            });


            // On remet l'image par défaut
            document.getElementById('fileInput').value = '';
            document.getElementById('prev-picture').src = 'images/profil/default.jpg';

            document.getElementById('ue-optionnel').classList.remove('hidden');
            document.getElementById('ue-optionnel').classList.add('hidden');

            // On reset les prévisualisations
            document.getElementById('prev-firstname-section').innerHTML = '<strong>[Prénom]</strong>';
            document.getElementById('prev-name-section').innerHTML = '<strong>[Nom de famille]</strong>';
            document.getElementById('prev-mail-section').innerHTML = 'adresse@mail.com';


        }
        else{
            // Dans l'autre cas on réinitialise les champs de l'UE

            document.getElementById('fileInput2').value = '';

            document.getElementById('prev-code-section').innerHTML = '<strong>[Code]</strong>';
            document.getElementById('prev-nomUe-section').innerHTML = `<strong>[Nom de l'UE]</strong>`;

            document.getElementById('ue_id').value = '';
            document.getElementById('ue_nom').value = '';

            // On désactive aussi le champs de code ue de base
            document.getElementById('ue_id').disabled = false


        }
        // On reset les drag and drop + les multiselects
        resetDropZone()
        resetAllMultiSelect();
    }

    /**
     * Fonction pour supprimer un utilisateur
     * @param id
     */
    deleteUser(id) {
        // On fait la requete pour supprimer un utilsiateur
        fetch(`/admin/delete-user/${id}`, {
            method: 'DELETE',
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
            .then(response => response.json())
            .then(data => {
                // Si la fonction s'est exécuté avec succès
                if (data.success) {
                    // On récupère l'élément HTML lié à l'utilsiateur et on le supprime
                    const userCard = document.getElementById(`user-${id}`);
                    if (userCard) {
                        userCard.remove();
                    }

                    // Petite alerte pour informer visuellement l'utilsiateur
                    alerte.showSuccess("Suppresion réussi de l'utilisateur");

                    // On met à jour les statistiques
                    this.editStat();

                    // Et on ferme toutes les popup
                    this.closeAll();
                } else {
                    // Element visuel en cas d'erreur lors de la suppresion
                    alerte.showError("Erreur lors de la suppression");
                }
            })
            .catch(error => {
                console.error('Erreur:', error);
                alerte.showError("Erreur lors de la suppression");
            });
    }


    /**
     * Ouverture du popup d'ajout d'utilisateur avec initialisation pour les champs le nécessitant
     * @returns {Promise<void>}
     */
    async openAddPopupUser(){

        // On récupère depuis la bdd les ue et on spécifie leur position pour pouvoir les ajouter dans le multiselect
        this.loadUEOptions('user-options-list', 'user');

        // On affiche la popup ainsi que l'overay en enlevant le champs hidden
        document.getElementById('add-user-popup').classList.remove('hidden');
        document.body.style.overflow = "hidden"
        this.overlay.classList.remove('hidden');

        // On affecte la fonction pour ajouter l'utilisateur au boutton add
        const addButton = document.getElementById('add-user-button');
        addButton.innerHTML = "Créer l'utilisateur";
        addButton.onclick = () => this.addUser();


    }

    /**
     * Fonction qui va récupérer toutes les données et qui va appeler la fonction pour créer un utilsiateur
     */
    addUser() {
        // Récupération des infos du formulaire
        const nom = document.getElementById('utilisateur_nom').value;
        const prenom = document.getElementById('utilisateur_prenom').value;
        const email = document.getElementById('utilisateur_email').value;
        const password = document.getElementById('utilisateur_password').value;


        // Récupération des rôles sélectionnés
        const selectedRole = document.querySelectorAll('#check-button input[type="checkbox"]');
        let selectedRoles = [];

        selectedRole.forEach(r => {
            if (r.checked) {
                selectedRoles.push(r.value);
            }
        });

        // Récupération des UE sélectionnées
        const selectedUE = document.querySelectorAll('.selected-options .tag');
        let allUeSelected = [];

        selectedUE.forEach(ue => {
            allUeSelected.push(ue.dataset.value);
        });

        // Préparation des données à envoyer
        const userData = {
            nom: nom,
            prenom: prenom,
            email: email,
            password: password,
            roles: selectedRoles,
            ues: allUeSelected,
            image: "default.jpg" // Par défaut
        };

        // Si un fichier est sélectionné, on l'upload d'abord
        const fileInput = document.getElementById('fileInput');
        const file = fileInput.files[0];

        if(file){
            // Si on a une image on effectue on la rajoute côté backend
            const imageData = new FormData();

            // Formation des données
            imageData.append('file', file);
            imageData.append('dest', '/public/images/profil/')


            // Fonction qui nous permet d'ajouter une image dans le repertoire profil
            fetch('/admin/upload-image', {
                method: 'POST',
                body: imageData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            }).then( response => {
                if(!response.ok){
                    // Si la réponse n'est pas ok -> on print pour débugger
                    console.log(response.text())
                }
                return response.json()
            }).then(data => {
                if(data.success){
                    // Dans le cas où l'image a été upload on la rajoute dans le tableau des données et on appelle la méthode pour crée un utilisateur
                    //console.log('Succès : ' + data);
                    //console.log(userData)

                    userData.image = data.image;
                    this.createUser(userData);
                } else{
                    // Affichage de la popup d'erreur qui indique à l'utilisateur que l'image n'est passé
                    alerte.showError("Erreur lors de l'upload de l'image: " + (data.error || "Erreur inconnue"));
                }

            }).catch(error => {
                console.error('Erreur:', error);
                alerte.showError("Erreur lors de l'upload de l'image");
            })
        } else {
            // SI pas d'image on crée quand même un utilisateur sans image
            this.createUser(userData);
        }
    }

    /**
     * Fonction qui va créer un utilisateur
     * @param userData
     */
    createUser(userData) {
        // Requête post qui ajoute un utilisateur
        fetch('/admin/add-user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify(userData) // On envoie le tableau dans le body
        })
            .then(response => response.json())
            .then(data => {

                if (data.success) {
                    // Si on a réussi à ajouter un utilisateur on reset la popup, et on met à jour les statistiques
                    this.editStat();
                    this.closeAll();

                    // Appel de  la méthode pour mettre à jour visuellement
                    this.addUserToList(data.user);
                    alerte.showSuccess("Utilisateur créé avec succès !");
                } else {
                    alerte.showError(data.error || "Erreur lors de la création de l'utilisateur");
                }
            })
            .catch(error => {
                console.error('Erreur:', error);
                alerte.showError("Erreur lors de la création de l'utilisateur");
            });
    }

    /**
     * Injecte un utilisateur dans l'HTLM pour l'afficher sans actualier la page
     * @param user
     */
    addUserToList(user) {
        // Récupération du conteneur des utilisateurs
        const userContainer = document.querySelector('.card-container');

        // On l'affiche de façon propre
        const rolesTransformed = user.roles
            .map(r => {
                if (r === 'ROLE_ELEVE') return 'Élève';
                if (r === 'ROLE_ADMINISTRATEUR') return 'Administrateur';
                if (r === 'ROLE_PROFESSEUR') return 'Professeur';
                return r;
            })
            .join(' - ');

        if (userContainer) {
            // Création de la card utilisateur
            const userCard = document.createElement('div');
            userCard.id = `user-${user.id}`;
            userCard.className = 'card-box';

            // Construction du HTML de la card utilisateur (pareil que dans admin/index
            userCard.innerHTML = `
                   <div class="card-left">
                        <img id="user-picture" src="images/profil/${user.image}"  alt="Photo de profil admin">
                        <div class="card-content">
                            <h4 id="name-firstname-section">${user.prenom} ${ user.nom }</h4>
                            <h4 id="roles-section" class="card-text">
                                ${rolesTransformed}
                            </h4>
                        </div>
                    </div>
                    <div class="card-action">
                        <i onclick="modifierUtilisateur(${user.id})" class="fa-solid fa-pen edit-icon edit"></i>
                        <i onclick="supprimerUtilisateur(${user.id})" class="fa-solid fa-trash edit-icon delete"></i>
                    </div>
        `;

            // Ajout de la card au conteneur
            userContainer.appendChild(userCard);
        }
    }

    /**
     * Fonction qui ouvre la popup de modification et on remplit les champs du formulaire avec les données de l'utilisateur
     * @param id
     * @param nom
     * @param prenom
     * @param email
     * @param image
     * @param roles
     * @param ue
     * @param password
     * @returns {Promise<void>}
     */
    async openModifyUserPopup(id, nom, prenom, email, image, roles,ue, password){
        // On remplit les champs du formulaire avec les données de l'utilisateur

        // On réupère l'id de l'utilsiateur pour pouvoir récuperer ses informations
        document.getElementById('utilisateur_id').value = id;

        document.getElementById('add-user-popup').classList.remove('hidden');
        document.body.style.overflow = "hidden"
        this.overlay.classList.remove('hidden');

        // Change le texte du bouton pour refléter qu'on est en mode modification
        const addButton = document.getElementById('add-user-button');
        addButton.innerHTML = "Modifier l'utilisateur";

        // Affiche les anciennes infos dans la section de prévisualisation
        document.getElementById('prev-firstname-section').innerHTML = `<strong>${prenom}</strong>`;
        document.getElementById('prev-name-section').innerHTML = `<strong>${nom}</strong>`;
        document.getElementById('prev-mail-section').innerHTML = `<strong>${email}</strong>`;

        document.getElementById('prev-picture').src = '/images/profil/' + image;

        // Pré-remplit les champs du formulaire
        document.getElementById('utilisateur_nom').value = nom;
        document.getElementById('utilisateur_prenom').value = prenom;
        document.getElementById('utilisateur_email').value = email;
        document.getElementById('utilisateur_password').value = password;


        // Coche les rôles correspondants
        const roleSection = document.querySelectorAll('.role-section #check-button input[type="checkbox"]');

        roleSection.forEach(checkbox => {
            const roleId = parseInt(checkbox.value);
            const hasRole = roles.some(role => role.id_role === roleId);
            checkbox.checked = hasRole;
        });

        // Des fois cette fonction est appelé avant que les éléments soit chargés, donc lors du premier click ça m'affichait pas les UE
        this.loadUEOptions('user-options-list', 'user', () => {
            if (ue && Array.isArray(ue)) {

                // On vide les anciennes sélections
                document.querySelectorAll('.option.selected').forEach(opt => opt.classList.remove('selected'));
                document.getElementById('user-selected-options').innerHTML = '';

                // On ajoute les UE sélectionnées dans notre multiselect
                ue.forEach(ueItem => {
                    const code = ueItem.code;
                    const noms = ueItem.nom;

                    // Pour toutes les UE séléctionnées on les rajoute dans le input et dans la prv
                    const option = document.querySelector(`.option[data-value="${code}"]`);
                    if (option) {
                        option.classList.add('selected');

                        const tag = document.createElement('span');
                        tag.className = 'tag';
                        tag.dataset.value = code;
                        tag.dataset.nom = noms;
                        tag.innerHTML = `<i class="fa fa-code"></i> ${noms} <span onclick="removeTag('${code}', event, 'user')">✖</span>`;
                        document.getElementById('user-selected-options').appendChild(tag);
                    }
                });

                // Comme toute à l'heure dans openAddUE
                updateHiddenInput('user');
                updatePreviewUEList('user');
            }
        });

        // Quand on clique sur "Modifier l'utilisateur", on appelle la fonction `editUser`
        addButton.onclick = () => this.editUser();
    }

    /**
     * Fonction appelé qui va récupérer les éléments, pour former le tableau a envoyé
     */
    editUser(){
        // on récupère toutes nos données depuis les différents input
        const id =document.getElementById('utilisateur_id').value;
        const nom = document.getElementById('utilisateur_nom').value;
        const prenom = document.getElementById('utilisateur_prenom').value;
        const email = document.getElementById('utilisateur_email').value;
        const password = document.getElementById('utilisateur_password').value;

        // Récupération des rôles sélectionnés
        const selectedRole = document.querySelectorAll('#check-button input[type="checkbox"]');
        let selectedRoles = [];

        // Chaque role sélectionné on le rajoute dans notre tableau de roles
        selectedRole.forEach(r => {
            if (r.checked) {
                selectedRoles.push(parseInt(r.value));
            }
        });

        // Récupération des UE sélectionnées
        const selectedUE = document.querySelectorAll('.selected-options .tag');
        let allUeSelected = [];

        selectedUE.forEach(ue => {
            allUeSelected.push(ue.dataset.value);
        });


        // Préparation des données à envoyer
        const userData = {
            id : id,
            nom: nom,
            prenom: prenom,
            email: email,
            roles: selectedRoles,
            ues: allUeSelected,
            password: password,
            image: "" // image par défaut
        };

        // Si un fichier est sélectionné, on l'upload d'abord comme pour l'ajout d'un utilisateur
        const fileInput = document.getElementById('fileInput');
        const file = fileInput.files[0];

        if(file){
            // Si on a fichier comme tout à l'heure on envoie déjà le fichier dans le backend avant d'ajouter
            const imageData = new FormData();
            imageData.append('file', file);
            imageData.append('nom', nom);
            imageData.append('prenom', prenom);
            imageData.append('id_user', id)
            imageData.append('dest', '/public/images/profil/')

            fetch('/admin/upload-image', {
                method: 'POST',
                body: imageData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            }).then( response => {
                if(!response.ok){
                    console.log(response.text())
                }
                return response.json()
            }).then(data => {
                if(data.success){
                    // Toujours même fonctionnement si le fichier a bien été upload
                    userData.image = data.image;
                    this.modifyUser(userData);
                } else{
                     alerte.showError("Erreur lors de l'upload de l'image: " + (data.error || "Erreur inconnue"));
                }

            }).catch(error => {
                console.error('Erreur:', error);
                  alerte.showError("Erreur lors de l'upload de l'image");
            })
        } else {
            this.modifyUser(userData);
        }
    }

    /**
     * Fait la requête PUT pour modifier un utilisateur côté serveur.
     * @param userData
     */
    modifyUser(userData){
        fetch("/admin/edit-user/" + userData.id.trim() , {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify(userData)
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {

                    // Comme pour l'ajout on met  à jour les statistiques, on ferme la popup et on ajoute visuellement l'utilsiateur
                    this.editStat();
                    this.closeAll();
                    this.editUserToList(data.user);

                    // Et on affiche que l'edition a bien été fait
                    alerte.showSuccess("Utilisateur modifié avec succès !");
                } else {
                    alerte.showError(data.error || "Erreur lors de la création de l'utilisateur");

                }
            })
            .catch(error => {
                console.error('Erreur:', error);
                alerte.showError("Erreur lors de la création de l'utilisateur");
            });

    }

    /**
     * Fonction qui modifie visuellement l'utilsiateur précédemment modifié
     * @param user
     */
    editUserToList(user) {
        // Donc on récupère l'élément HTML grâce à l'ID de l'utilisateur
        const userCard = document.getElementById("user-" + user.id);

        if (!userCard) return; // Si l'élément n'existe pas, on sort

        // Mise à jour de l'image
        userCard.querySelector("img").src = "images/profil/" + user.image;

        // Mise à jour du nom et prénom
        userCard.querySelector(".card-content h4:first-child").innerHTML = user.prenom + " " + user.nom;

        // Transformation et mise à jour des rôles
        const rolesTransformed = user.roles
            .map(r => {
                if (r === 'ROLE_ELEVE') return 'Élève';
                if (r === 'ROLE_ADMINISTRATEUR') return 'Administrateur';
                if (r === 'ROLE_PROFESSEUR') return 'Professeur';
                return r;
            })
            .join(' - ');

        userCard.querySelector("#roles-section").innerHTML = rolesTransformed;
    }

    /**
     * Charge dynamiquement les UE depuis le backend et les affiche dans la liste de sélection.
     * @param containerId
     * @param nomDuMultiselect
     * @param callback
     */
    loadUEOptions(containerId, nomDuMultiselect = 'user', callback) {
        // Requête pour récuperer toutes les UE depuis le backend
        fetch('/admin/get-ue')
            .then(res => res.json())
            .then(ueList => {

                // Donc après les avoir récupérer on vide l'endroit ou les UE/USER sont affichés
                const optionsList = document.getElementById(containerId);
                optionsList.innerHTML = '';

                // Et on les reaffiche dans le multislect
                ueList.forEach(unite => {
                    const div = document.createElement('div');
                    div.className = 'option';
                    div.dataset.value = unite.code;
                    div.dataset.nom = unite.nom;
                    div.onclick = () => toggleOption(div, nomDuMultiselect);
                    div.innerHTML = `<i class="fa fa-code"></i> ${unite.nom}`;
                    optionsList.appendChild(div);
                });

                // Le callback permet de rappeler une fonction derrière pour ajouter celle qui sont déjà ajouter
                // J'ai du faire comme ça car on avait des problèmes au départ
                if(callback) callback();
            })
            .catch(error => {
                console.error("Erreur lors du chargement des UE", error);
            });
    }

    /**
     * Ouvre la popup d'ajout d'une nouvelle UE (unité d’enseignement).
     */
    openAddPopupUE(){
        // Comme pour l'ouverture des autre popup on affiche les popup
        document.getElementById('add-ue-popup').classList.remove('hidden');
        document.body.style.overflow = "hidden"
        this.overlay.classList.remove('hidden');

        // On affecte le boutton de création
        const addButton = document.getElementById('add-ue-button');
        addButton.innerHTML = "Créer l'UE";
        addButton.onclick = () => this.addUe();

        // Et on récupère les responsables possiblement affectables (chaque ue à un responsable)
        this.getResponsable();

        // On récupère également les elèves et professeurs affectables à l'UE
        this.getUtilisateurAffectable();
    }

    /**
     * Fonction qui permet d'afficher dans la popup utilisateur, le formulaire de création d'une UE
     * @param data
     */
    displayAdditionnalPartOfPopup(data){
        // On affiche la section de l'UE
        document.getElementById('ue-optionnel').classList.remove('hidden');



        const responsableSelect = document.getElementById('ue-user_responsable_id'); // ID du select
        responsableSelect.innerHTML = ''; // On vide le select avant d'ajouter les nouvelles options

        // on récupère égalemnt les responsables possible et on les ajoute
        const options = document.createElement('option');
        options.value = '';
        options.textContent = "Choisissez un responsable";
        responsableSelect.appendChild(options);

        // on ajoute chaque responsable possible
        data.forEach(responsable => {
            const option = document.createElement('option');
            option.value = responsable.id;
            option.textContent = responsable.name;
            responsableSelect.appendChild(option);

        });

        // Quand on appuie sur le boutton cancel on enlève la section
        document.getElementById('cancel-ue-fromuser').addEventListener('click', () => {
            this.resetAdditionalPartOfPopup()
        })

        // SInon on ajoute l'UE
        document.getElementById('add-ue-fromuser').addEventListener('click', () => {
            this.addAddionalUE()
        })


    }

    /**
     * On enlève la section optionnelle d'ajout d'UE dans USer
     */
    resetAdditionalPartOfPopup(){
        // On cache la div et on reset les input
        document.getElementById('ue-optionnel').classList.add('hidden');
        document.getElementById('add-code-ue-inuser').value = '';
        document.getElementById('add-nom-ue-inuser').value = '';

    }

    /**
     * Fonction qui permet d'ajouter une UE depuis la popup d'ajout d'utilsateur
     */
    addAddionalUE(){
        // On récupère tous les champs de l'UE pour les ajouter
        const code = document.getElementById('add-code-ue-inuser').value;
        const name = document.getElementById('add-nom-ue-inuser').value;
        const responsable_id = document.getElementById('ue-user_responsable_id').value;

        // Si tous les champs sont remplis on formule le tableau qui va envoyer les données
        if(code !== "" && name !== "" && responsable_id!== ""){
            const ueData = {
                id: code,
                nom: name,
                responsable_id: responsable_id ,
                utilisateurs: [],
                image: 'default-ban.jpg'
            };
            // Ensuite on appelle la fonction qui crée une UE
            this.createUe(ueData, false)
                .then(result => {
                    if(result.success){
                        // Si tout se passe bien, on affiche visuellement l'UE et on enlève la section optionnelle
                        this.loadUEOptions('user-options-list', 'user');
                        this.resetAdditionalPartOfPopup();
                    }
                })

        } else{
            alerte.showError('Remplissez tous les champs')
        }

    }

    /**
     * Fonction qui permet de récupérer tous les responsables affectables
     * @param responsable_id
     */
    getResponsable(responsable_id){
        // requête pour récupérer les responsables depuis le backend
        fetch('/admin/get-responsables')
            .then(res => res.json())
            .then(data => {
                const responsableSelect = document.getElementById('ue_responsable_id'); // ID du select
                responsableSelect.innerHTML = ''; // On vide le select avant d'ajouter les nouvelles options

                const options = document.createElement('option');
                options.value = '';
                options.textContent = "Choisissez un responsable";
                responsableSelect.appendChild(options);

                // Comme d'habitude on ajoute dans le select tous les responsables affectables
                data.forEach(responsable => {
                    const option = document.createElement('option');
                    option.value = responsable.id;
                    option.textContent = responsable.name;
                    // Si on a un responsable_id de base on le selectionne (utile pour le edit)
                    if(responsable_id && responsable_id === responsable.id)
                    {
                        option.selected = true;
                    }
                    responsableSelect.appendChild(option);

                });
            })
            .catch(error => {
                console.error("Erreur lors du chargement des responsables", error);
            });

    }

    /**
     * Ici on récupère tous les utilisateurs qui peuvent être affectables à une UE
     * @param callback
     */
    getUtilisateurAffectable(callback){
        fetch('/admin/get-utilisateurs-affectable')
            .then(res => res.json())
            .then(data => {
                // Comme d'habitude dans le multi select on récupére le conteneur et on ajoute tous les utilsiateurs
                const optionsList = document.getElementById('ue-options-list');
                optionsList.innerHTML = '';

                // Pour chaque utilsiateur on l'ajoute dans le multiselect
                data.forEach(utilisateur => {
                    const optionDiv = document.createElement('div');
                    optionDiv.className = 'option';
                    optionDiv.onclick = function() { toggleOption(this, 'ue'); };
                    optionDiv.setAttribute('data-value', utilisateur.id);
                    optionDiv.setAttribute('data-nom', utilisateur.nom);

                    const icon = document.createElement('i');
                    icon.className = 'fa-regular fa-user';

                    optionDiv.appendChild(icon);
                    optionDiv.appendChild(document.createTextNode(` ${utilisateur.nom}`));

                    optionsList.appendChild(optionDiv);

                    // Le callback c'est dans le cas où on a dejà des utilsiateurs on les rajoute dans le callback
                    // Utile pour le edit mais pas pr le ajout d'ou le callback
                    if(callback) callback()

                });
            })
            .catch(error => {
                console.error("Erreur lors du chargement des utilisateurs", error);
            });
    }

    /**
     * Fonction appelée pour récupérer les données du formulaire de création d'une UE,
     * uploader une image si besoin, et envoyer le tout au backend pour créer l'UE.
     */
    addUe(){
        // Récupération des utilisateurs sélectionnés dans le champ multi-select
        const selectedUser = document.querySelectorAll('.selected-options .tag');
        let allUserSelected = [];

        selectedUser.forEach(ue => {
            allUserSelected.push(ue.dataset.value);
        });

        // Construction de l'objet UE à envoyer au backend
        const ueData = {
            id: document.getElementById('ue_id').value,
            nom: document.getElementById('ue_nom').value,
            responsable_id: document.getElementById('ue_responsable_id').value || null,
            utilisateurs: allUserSelected,
            image: 'default-ban.jpg' // Image par defaut
        };


        // Gestion du fichier image
        const fileInput = document.getElementById('fileInput2');
        const file = fileInput.files[0];

        // Si une image est présente, on l'upload d'abord
        if(file){
            const imageData = new FormData();
            imageData.append('file', file);
            imageData.append('dest', '/public/images/ue/')

            // Même processus que pour l'ajout utilisateur
            fetch('/admin/upload-image', {
                method: 'POST',
                body: imageData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            }).then( response => {
                if(!response.ok){
                    console.log(response.text());
                }
                return response.json();
            }).then( data => {
                if(data.success){
                    // Si tout est bon on met à jour l'utilsiateur et on crée appelle la fonction qui crée l'UE
                    ueData.image = data.image;

                    // Le reset permet de fermer la popup
                    this.createUe(ueData, true);
                } else {
                    alerte.showError("Erreur lors de l'upload de l'image: " + (data.error || "Erreur inconnue"));
                }
            }).catch(e => {
                console.error('Erreur ', e)
            })
        } else {
            // SI pas d'image on crée quand même l'ue avec l'image par def, l
            this.createUe(ueData, true);

        }
    }

    /**
     * Envoie une requête POST pour créer l'UE
     * @param {Object} userData - Données de l'UE à créer
     * @param {Boolean} reset - Si true, on ferme la popup après création
     */
    createUe(userData, reset){
        // Comme à un moment j'appelle createUE dans addUtilisateur, je veux pas que il ferme la popup donc j'ai ajouté le paramètre reset
        return fetch('/admin/add-ue', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify(userData)
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Comme tout le reste du code, quand tout est bon on ferme la popup si y'a reset, on edit les stat et on modifie visuellement

                    this.editStat();
                    if(reset){
                        this.closeAll();
                    }
                    this.addUEToList(data.ue);
                    alerte.showSuccess("UE créé avec succès !");
                    // Car cette fonction est appelé dasn une fonction on doit voir si elle s'est bien exécuté
                    return { success: true, data: data.ue }; // <-- On retourne un truc clair
                } else {
                    alerte.showError(data.error || "Erreur lors de la création de l'UE");
                    return { success: false, error: data.error || "Erreur lors de la création de l'UE" }; // <-- Pareil ici

                }
            })
            .catch(error => {
                console.error('Erreur:', error);
                alerte.showError("Erreur lors de la création de l'UE");
                return { success: false, error: error.message || "Erreur lors de la création de l'UE" }; // <-- Même en cas d'exception
            });
    }


    /**
     * Ajoute l'UE nouvellement créée à la liste des UEs dans l'interface
     * @param {Object} ue - L'objet UE retourné par l'API
     */
    addUEToList(ue) {
        const ueContent = document.getElementById('ue-content');
        if (!ueContent) return;

        // Créer un nouvel élément de card UE
        const cardBox = document.createElement('div');
        cardBox.className = 'card-box';
        cardBox.id = 'ue-'+ue.id;

        // Récupérer les noms du responsable (si disponible)
        let nomResponsable = ue.responsable_nom;
        let prenomResponsable = ue.responsable_prenom;


        // Construire le HTML de la card
        cardBox.innerHTML = `
        <div class="card-left">
            <img id="ue-picture" src="./images/ue/${ue.image}" alt="Image UE">
            <div class="card-content" id="ue-${ue.id}">
                <h4>${ue.nom}</h4>
                <h4 id="ue-roles-section" class="card-text">Responsable : ${prenomResponsable} ${nomResponsable}</h4>
            </div>
        </div>
        <div class="card-action">
            <i onclick="modifierUE('${ue.id}')" class="fa-solid fa-pen edit-icon edit"></i>
            <i onclick="supprimerUE('${ue.id}')" class="fa-solid fa-trash edit-icon delete"></i>
        </div>
    `;

        ueContent.appendChild(cardBox);

    }

    /**
     * Ouvre la popup de modification d'une UE avec ses données pré-remplies.
     * @param code
     * @param nom
     * @param responsable_id
     * @param responsable_nom
     * @param image
     * @param affecte
     */
    openEditPopupUE(code, nom, responsable_id, responsable_nom, image, affecte) {

        // Affiche la popup comme d'habitude
        document.getElementById('add-ue-popup').classList.remove('hidden');
        document.body.style.overflow = "hidden";
        this.overlay.classList.remove('hidden');

        // On change le contenu du boutton et on lui affecte la fonction pour modifier
        const addButton = document.getElementById('add-ue-button');
        addButton.innerHTML = "Modifier l'UE";
        addButton.onclick = () => this.editUE();

        // Pré-remplir les champs texte
        document.getElementById('ue_id').value = code;

        // UN id ne doit pas pouvoir être changer donc on l'affiche masi on ne peut pas le changer
        document.getElementById('ue_id').disabled = true;



        document.getElementById('ue_nom').value = nom;


        // On récupere tous les responsables effectable
        this.getResponsable(responsable_id);

        // On pré rempli les champs
        document.getElementById('ue_responsable_id').value = responsable_id
        document.getElementById('prev-code-section').innerHTML = `<strong>${code}</strong>`
        document.getElementById('prev-nomUe-section').innerHTML = `<strong>${nom}</strong>`

        document.getElementById('prev-picture-ue').src = 'images/ue/' + image;

        // On récupère les utilisateurs affectables, et on coche ceux qui sont déja affecte (comme c'est le edit
        this.getUtilisateurAffectable(() => {

            document.querySelectorAll('.option.selected').forEach(opt => opt.classList.remove('selected'));
            document.getElementById('ue-selected-options').innerHTML = '';

            affecte.forEach(userItem => {
                const code = userItem.id;
                const noms = userItem.nom + " " + userItem.prenom;

                const option = document.querySelector(`.option[data-value="${code}"]`);
                if (option) {
                    option.classList.add('selected');

                    const tag = document.createElement('span');
                    tag.className = 'tag';
                    tag.dataset.value = code;
                    tag.dataset.nom = noms;
                    tag.innerHTML = `<i class="fa fa-user"></i> ${noms} <span onclick="removeTag('${code}', event, 'ue')">✖</span>`;
                    document.getElementById('ue-selected-options').appendChild(tag);
                }
            });

            // Comme d'habitude on rappelle ces fonctions pour mettre à jour la liste d epreview, et l'input
            updateHiddenInput('ue');
            updatePreviewUEList('ue');
        });

    }


    /**
     * Prépare les données pour la modification d'une UE, et gère l'upload d'image si elle est modifiée.
     */
    editUE(){
        // Comme d'habitude on récupère les champs nécessaires
        const fullPath = document.getElementById('prev-picture-ue').src;

        // Pour l'image on récupère juste le nom de l'image et on enlève tout ce qu'il y'a avant
        const fileName = fullPath.substring(fullPath.lastIndexOf('/') + 1);

       const selectedUser = document.querySelectorAll('.selected-options .tag');
        let allUserSelected = [];

        selectedUser.forEach(ue => {
            allUserSelected.push(ue.dataset.value);
        });

        // Ensuite comme d'habitude on prépare le tableau qui va être envoyé
        const ueData = {
            id: document.getElementById('ue_id').value,
            nom: document.getElementById('ue_nom').value,
            responsable_id: document.getElementById('ue_responsable_id').value || null,
            utilisateurs: allUserSelected,
            image: fileName
        };

        // Même processus que pour l'ajout/modificiation d'utilisateur
        const fileInput = document.getElementById('fileInput2');
        const file = fileInput.files[0];

        // Même processus que pour les autre, donc je vais pas re commenter
        if(file){
            const imageData = new FormData();
            imageData.append('file', file);
            imageData.append('dest', '/public/images/ue/')
            imageData.append('code', document.getElementById('ue_id').value);


            fetch('/admin/upload-image', {
                method: 'POST',
                body: imageData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            }).then( response => {
                if(!response.ok){
                    console.log(response.text());
                }
                return response.json();
            }).then( data => {
                if(data.success){
                    ueData.image = data.image;
                    this.modifyUE(ueData);
                } else {
                    alerte.showError("Erreur lors de l'upload de l'image: " + (data.error || "Erreur inconnue"));
                }
            }).catch(e => {
                console.error('Erreur ', e)
            })
        } else {
            this.modifyUE(ueData);

        }
    }


    /**
     * Fonction pour faire une requête qui edit une UE
     * @param data
     */
    modifyUE(data){
        fetch("/admin/edit-ue/" + data.id.trim() , {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Comme d'habitude si la requête s'est bien executé on s'occupe des élément visuels
                    this.editStat();
                    this.closeAll();
                    this.editUEToList(data.ue);

                    alerte.showSuccess("UE modifié avec succès !");
                } else {
                    alerte.showError(data.error || "Erreur lors de la création de l'utilisateur");

                }
            })
            .catch(error => {
                console.error('Erreur:', error);
                alerte.showError("Erreur lors de la création de l'utilisateur");
            });

    }

    /**
     * Fonction pour modifier visuellement l'UE après une edition
     * @param data
     */
    editUEToList(data){
        // On récupère la card et on met les informations à jour
        const userCard = document.getElementById("ue-" + data.id);

        if (!userCard) return;

        userCard.querySelector(".card-left img").src = "images/ue/" + data.image;

        // Mise à jour du nom et prénom
        userCard.querySelector(".card-content h4:first-child").innerHTML = data.nom;

        userCard.querySelector("#ue-roles-section").innerHTML = 'Responsable : ' + data.responsable_prenom + " " + data.responsable_nom;

    }

    /**
     * On ouvre la popup qui permet la supression
     * @param code
     * @param nom
     * @param image
     */
    openDeleteUEPopup(code, nom, image){
        // On récupère toutes les informations depuis la card afin de les afficher dans la nouvelle popup
        document.getElementById('delete-ue-popup').classList.remove('hidden');
        document.getElementById('picture-popup-ue').src = `images/ue/${image}`;
        document.getElementById('ue-delete-name').textContent = `${nom}`;
        document.body.style.overflow = "hidden"

        // On ajoute une utilité au boutton supprimer
        const deleteButton = document.getElementById('confirm-delete-ue');
        deleteButton.onclick = () => this.deleteUE(code);
        this.overlay.classList.remove('hidden');
    }

    /**
     * Fonction pour supprimer une UE
     * @param id
     */
    deleteUE(id) {
        fetch(`/admin/delete-ue/${id}`, {
            method: 'DELETE',
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Si la requête s'est bien exécuté on supprime l'élément visule
                    const userCard = document.getElementById(`ue-${id}`);
                    if (userCard) {
                        userCard.remove();
                    }
                    this.editStat();
                    alerte.showSuccess("Suppresion réussi de l'UE");
                    this.closeAll();
                } else {
                    alerte.showError("Erreur lors de la suppression");
                }
            })
            .catch(error => {
                console.error('Erreur:', error);
                alerte.showError("Erreur lors de la suppression");
            });
    }


    /**
     * Fonction qui met à jour les statitiques présent au top de la page
     */
    editStat(){
        try{
            fetch('/admin/get-stat')
                .then(res => res.json())
                .then(data => {
                    data.forEach(dat => {
                        // Pour chaque donnée on met à jour avec la valeur
                        document.getElementById(dat.id_stat).innerHTML = dat.nombre;
                    });
                })
        } catch (e){
            console.log(e)

        }

    }
}

// ELEMENT VISUEL DANS LES POPUP MAJORITAIREMENT DRAG AND DROP ET MULTI SELECT

// Ce fichier c'est esstentiellement pour la gestion des évènements visuels, en soit c'est des composants dans la popup
/**
 * Function lié au drag and drop
 */
function dropZoneLoaded() {
    document.querySelectorAll(".drop-zone__input").forEach((inputElement) => {
        const dropZoneElement = inputElement.closest(".drop-zone");

        // Clic sur la zone → ouvre le sélecteur de fichier
        dropZoneElement.addEventListener("click", (e) => {
            inputElement.click();
        });

        // Lorsqu'un fichier est sélectionné → met à jour la miniature
        inputElement.addEventListener("change", (e) => {
            if (inputElement.files.length) {
                updateThumbnail(dropZoneElement, inputElement.files[0]);
            }
        });

        // Ajoute une classe CSS pendant le drag
        dropZoneElement.addEventListener("dragover", (e) => {
            e.preventDefault();
            dropZoneElement.classList.add("drop-zone--over");
        });

        // Supprime l'effet visuel de drag quand on quitte la zone
        ["dragleave", "dragend"].forEach((type) => {
            dropZoneElement.addEventListener(type, (e) => {
                dropZoneElement.classList.remove("drop-zone--over");
            });
        });

        // Gère le drop du fichier
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
     * MEt à jour le thumbnail sur la zone de drop
     *
     * @param {HTMLElement} dropZoneElement
     * @param {File} file
     */
    function updateThumbnail(dropZoneElement, file) {
        let thumbnailElement = dropZoneElement.querySelector(".drop-zone__thumb");

        // Supprime le texte initial et les boutons si c'est la première fois
        if (dropZoneElement.querySelector(".drop-zone__prompt")) {
            dropZoneElement.querySelector(".drop-zone__prompt").remove();
            dropZoneElement.querySelector("div.separator").remove();
            dropZoneElement.querySelector("div.fake-button").remove();
        }

        // Si la miniature n'existe pas, on la crée
        if (!thumbnailElement) {
            thumbnailElement = document.createElement("div");
            thumbnailElement.classList.add("drop-zone__thumb");
            dropZoneElement.appendChild(thumbnailElement);
        }

        thumbnailElement.dataset.label = file.name;

        // Si c'est une image, on génère un aperçu
        if (file.type.startsWith("image/")) {
            const reader = new FileReader();

            reader.readAsDataURL(file);
            reader.onload = () => {
                thumbnailElement.style.backgroundImage = `url('${reader.result}')`;

                // Affiche aussi l’image dans l’aperçu à droite de la popup
                let cat = window.popupManager.popupCat

                let element = cat === 1 ? document.getElementById('prev-picture') : document.getElementById('prev-picture-ue');
                element.src = reader.result;
            };
        } else {
            thumbnailElement.style.backgroundImage = null;
        }
    }

}


/**
 * Réinitialise toutes les zones de drop (retire les miniatures, remet le texte, etc.)
 */
function resetDropZone() {
    const dropZoneElements = document.querySelectorAll('.drop-zone');

    dropZoneElements.forEach(dropZoneElement => {
        const inputElement = dropZoneElement.querySelector('.drop-zone__input');

        // Réinitialise l'input file
        inputElement.value = '';

        // Supprime la miniature si elle existe
        const thumbnailElement = dropZoneElement.querySelector('.drop-zone__thumb');
        if (thumbnailElement) {
            thumbnailElement.remove();
        }

        // Recrée les éléments initiaux s'ils ont été supprimés
        if (!dropZoneElement.querySelector('.drop-zone__prompt')) {
            const promptElement = document.createElement('div');
            promptElement.classList.add('drop-zone__prompt');
            promptElement.textContent = "Glissez-déposez un fichier ou cliquez pour sélectionner";

            const separator = document.createElement('div');
            separator.classList.add('separator');
            separator.textContent = "ou";

            const fakeButton = document.createElement('div');
            fakeButton.classList.add('fake-button');
            fakeButton.textContent = "Sélectionner un fichier";

            dropZoneElement.prepend(fakeButton);
            dropZoneElement.prepend(separator);
            dropZoneElement.prepend(promptElement);
        }

        let element, image;
        let cat = window.popupManager.popupCat;

        if (cat === 1) {
            element = document.getElementById('prev-picture')
            image = 'images/profil/default.jpg';
        } else {
            element = document.getElementById('prev-picture-ue');
            image = 'images/ue/default-ban.jpg'
        }


        if (element.src !== image) {
            element.src = image;
        }
    });
}

/**
 * Change nom dans la previsualition
 * @param prenom
 */
function changeFirstName(prenom){
    let result = prenom;
    if(result === ""){
        result = "[Prénom]"
    }
    document.getElementById('prev-firstname-section').innerHTML = `<strong>${result}</strong>`;

}


/**
 * Change nom dans la previsualition
 * @param nom
 */
function changeLastName(nom){
    let result = nom;
    if(result === ""){
        result = "[Nom de famille]"
    }
    document.getElementById('prev-name-section').innerHTML = `<strong>${result}</strong>`;

}

/**
 * Change la prev mail
 * @param mail
 */
function changeMail(mail){
    let result = mail;
    if(result === ""){
        result = "adresse@mail.com";
    }
    document.getElementById('prev-mail-section').innerHTML = `${result}`;

}

/**
 * Change la prev de code
 * @param code
 */
function changeCodeUE(code){
    let result = code;
    if(result === ""){
        result = "[Code]";
    }
    document.getElementById('prev-code-section').innerHTML = `<strong>${result}</strong>`;
}

/**
 * Change le nom de l'UE dans la prev
 * @param nom
 */
function changeNomUE(nom){
    let result = nom;
    if(result === ""){
        result = "[Nom de l'UE]";
    }
    document.getElementById('prev-nomUe-section').innerHTML = `<strong>${result}</strong>`;
}

function resetAllMultiSelect() {

    // Réinitialiser les sélections d'UE
    resetUESelections();

    // Réinitialiser les prévisualisations
    resetPreviews();

}

/**
 * Reset tous les champs des multiselect
 */
function resetUESelections() {
    // Pour les deux types (ue et user)
    ['ue', 'user'].forEach(pref => {
        // Désélectionner toutes les options
        document.querySelectorAll(`#${pref}-options-list .option.selected`).forEach(option => {
            option.classList.remove('selected');
        });

        // Supprimer tous les tags
        const selectedContainer = document.getElementById(`${pref}-selected-options`);
        if (selectedContainer) {
            selectedContainer.innerHTML = '';
        }

        // Réinitialiser l'input caché
        const hiddenInput = document.getElementById(`${pref}-ue-input`);
        if (hiddenInput) {
            hiddenInput.value = '';
        }
    });
}

/**
 * Reset les chamsp de la prev de l'UE
 */
function resetPreviews() {
    // Réinitialiser les prévisualisations d'UE
    const previewUE = document.getElementById('ue-prev-ue');
    const previewUser = document.getElementById('user-prev-ue');

    if (previewUE) previewUE.innerHTML = '';
    if (previewUser) previewUser.innerHTML = '';

    // Réinitialiser le prénom dans la prévisualisation
    changeFirstName('');
}


document.addEventListener('DOMContentLoaded', () => {
    // Ici on ajoute les listeners dans les input pour changer les valeurs dans la previsualisation
    document.getElementById('utilisateur_nom').addEventListener('keyup', (event) =>{
        changeLastName(event.target.value)
    })

    document.getElementById('utilisateur_prenom').addEventListener('keyup', (event) =>{
        changeFirstName(event.target.value)

    })

    document.getElementById('utilisateur_email').addEventListener('keyup', (event) =>{
        changeMail(event.target.value)

    })

    document.getElementById('ue_id').addEventListener('keyup', (event) => {
        changeCodeUE(event.target.value)
    })

    document.getElementById('ue_nom').addEventListener('keyup', (event) => {
        changeNomUE(event.target.value)
    })

    dropZoneLoaded()

    window.popupManager = new PopupManager();
})

