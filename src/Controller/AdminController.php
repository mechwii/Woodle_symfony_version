<?php

namespace App\Controller;

use App\Entity\Priorite;

use App\Entity\EstAffecte;
use App\Entity\TypeNotification;
use App\Entity\Notification;
use App\Entity\Role;
use App\Entity\UE;
use App\Form\UeType;
use App\Form\UserProfileType;
use App\Form\UtilisateurType;
use App\Entity\Utilisateur;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;

use Symfony\Component\HttpFoundation\Request;

use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;

final class AdminController extends AbstractController
{
    /**
     * Page principale
     * @param EntityManagerInterface $BDDManager
     * @param Request $request
     * @return Response
     * @throws \Doctrine\DBAL\Exception
     */
    #[Route('/admin', name: 'app_admin')]
    public function index(EntityManagerInterface $BDDManager, Request $request): Response
    {
        $session = $request->getSession();

        // Sur la sessions on met la variable 'vue_active' à admin -> car certains utilisateurs ont plusieurs roles, il nous faut donc un moyen de différencier le role actuel
        $session->set('vue_active', 'admin');


        $connection = $BDDManager->getConnection();

        // Récupération des UE avec Nom Responsable
        $sql = 'SELECT Ue.code, Ue.nom, Ue.image, u.nom as nom_responsable, u.prenom as prenom_responsable  FROM Ue INNER JOIN Utilisateur u ON u.id_utilisateur = UE.responsable_id';
        $prepareSQL = $connection->prepare($sql);
        $resultat = $prepareSQL->executeQuery();
        $ue = $resultat->fetchAllAssociative();

        // On récupère l'utilisateur courant
        $utilisateur = $this->getUser();
        $roles = $utilisateur->getRoles();

        // On  récupère les statistiques depuis une méthode de classe
        $statistiques = $this->getStatisticsData($BDDManager);

        $allUtilisateur = $BDDManager->getRepository(Utilisateur::class)->findAll();
        $AllRoles = $BDDManager->getRepository(Role::class)->findAll();

        $nouvelUtilisateur = new Utilisateur();
        $form = $this->createForm(UtilisateurType::class, $nouvelUtilisateur);
        $form->handleRequest($request);

        $newUe = new UE();
        $form2 = $this->createForm(UEType::class, $newUe);
        $form2->handleRequest($request);

        return $this->render('admin/index.html.twig', [
            'form' => $form->createView(),
            'form2' => $form2->createView(),
            'controller_name' => 'AdminController',
            'utilisateur' => $utilisateur,
            'roles' => $roles,
            "statistiques" => $statistiques,
            "allUtilisateur" => $allUtilisateur,
            "ue" => $ue,
            "allRoles" => $AllRoles,
        ]);
    }

    /**
     * Fonction pour pouvoir produire un appel externe et récupère les statistiques
     * @param EntityManagerInterface $BDDManager
     * @return JsonResponse
     */
    #[Route('/admin/get-stat', name: 'get_admin_stat')]
    public function getStat(EntityManagerInterface $BDDManager): JsonResponse
    {
        // On retourne un JSON qui contient les statistiques (utiles pour les appel GET) afin d'avoir un site reactif
        return new JsonResponse($this->getStatisticsData($BDDManager));
    }

    /**
     * Méthode privée pour avoir différentes statistiques
     * @param EntityManagerInterface $BDDManager
     * @return array[]
     */
    private function getStatisticsData(EntityManagerInterface $BDDManager): array
    {
        // On retourne un JSON avec toutes nos statistiques
        // DOnc elle se retrouve globaleemnt sur la même forme, et ça compte le nbr d'élèves, de professeure et d'UE
        return [
            [
                "id_stat" => "nb_eleve",
                "nom" => "Nombre d'élèves",
                "nombre" => $BDDManager->getRepository(Utilisateur::class)
                    ->createQueryBuilder('u')
                    ->select('COUNT(DISTINCT u.id)')
                    ->join('u.roles', 'r', 'WITH', 'r.id = :roleId')
                    ->setParameter('roleId', 3)
                    ->getQuery()
                    ->getSingleScalarResult(),
                "icons" => "lni lni-user-multiple-4"
            ],
            [
                "id_stat" => "nb_enseignant",
                "nom" => "Nombre d'enseignants",
                "nombre" => $BDDManager->getRepository(Utilisateur::class)
                    ->createQueryBuilder('u')
                    ->select('COUNT(DISTINCT u.id)')
                    ->join('u.roles', 'r', 'WITH', 'r.id = :roleId')
                    ->setParameter('roleId', 2)
                    ->getQuery()
                    ->getSingleScalarResult(),
                "icons" => "lni lni-coffee-cup-2"
            ],
            [
                "id_stat" => "nb_ue",
                "nom" => "Nombre d'UE",
                "nombre" => $BDDManager->getRepository(UE::class)->count([]),
                "icons" => "lni lni-graduation-cap-1"
            ]
        ];
    }

    /**
     * page profile coté admin (on a une seule page profile qu'on render juste depuis plusieurs controller)
     * @param EntityManagerInterface $BDDManager
     * @param Request $request
     * @return Response
     */
    #[Route('/admin/profil', name: 'admin_profil')]
    public function profile(EntityManagerInterface $BDDManager, Request $request): Response
    {
        // Etant donnée que le mail est unique et ne peut être changé on récupère par mail (on aurait pu également récupérer par l'ID)
        $utilisateur = $BDDManager->getRepository(Utilisateur::class)->findOneBy(["email" => $this->getUser()->getUserIdentifier()]);
        $roles = $utilisateur->getRoles();


        // Même si on fait des requeêtes AJAX on génère des formulaires afin de vérifier les entrées
        $nouvelUtilisateur = new Utilisateur();
        $form = $this->createForm(UserProfileType::class, $nouvelUtilisateur);
        $form->handleRequest($request);

        // Et ducoup on retourne l'utilisateur, ses roles ainsi que le formulaire

        return $this->render('profil/profil.html.twig', [
            'controller_name' => 'AdminController',
            'utilisateur' => $utilisateur,
            'roles' => $roles,
            'form' => $form->createView(),
        ]);
    }

    /**
     * Getter pour avoir un utilisateur grâce à son ID
     * @param int $id
     * @param EntityManagerInterface $BDDManager
     * @return JsonResponse
     * @throws \Doctrine\DBAL\Exception
     */
    #[Route('/admin/get-user/{id}', name: 'admin_get_user', methods: ['GET'])]
    public function getUtilisateur(int $id, EntityManagerInterface $BDDManager): JsonResponse
    {
        // Etant donnée les instructions on initialise une connexion dans le but de pouvoir aussi faire des requetes SQL
        $connection = $BDDManager->getConnection();

        // On récupère l'utilisateur avec l'id donnée
        $user = $BDDManager->getRepository(Utilisateur::class)->find($id);

        // Ensuite on récupère toutes les UE liées à cette utilisateur
        $sql = 'SELECT u.code, u.nom
        FROM est_affecte
        INNER JOIN ue u on u.code = est_affecte.code_id
        WHERE est_affecte.utilisateur_id= :id;';
        $ue = $connection->prepare($sql)->executeQuery(['id' => $user->getId()])->fetchAllAssociative();


        // Pareil ici on récupère ces roles
        $sql2 = 'SELECT r.id_role, r.nom
         from possede 
         INNER JOIN Role r on r.id_role = possede.role_id 
         WHERE possede.utilisateur_id = :id;';
        $roles = $connection->prepare($sql2)->executeQuery(['id' => $user->getId()])->fetchAllAssociative();


        // Et dans le cas où on ne trouve pas l'utilsiateur on renvoie une erreur
        if (!$user) {
            return new JsonResponse(['error' => 'Utilisateur non trouvé'], 404);
        }

        return new JsonResponse([
            'id' => $user->getId(),
            'nom' => $user->getNom(),
            'email' => $user->getEmail(),
            'prenom' => $user->getPrenom(),
            'image' => $user->getImage(),
            'password' => $user->getPassword(),
            'roles' => $roles,
            'ue' => $ue
        ]);
    }

    /**
     * Ajoute un utilisateur avec Ajax et validation de formulaire
     * @param Request $request
     * @param EntityManagerInterface $entityManager
     * @param ValidatorInterface $validator
     * @param NotificationController $notificationController
     * @return Response
     */
    #[Route('/admin/add-user', name: 'admin_add_user', methods: ['POST'])]
    public function addUser(
        Request                $request,
        EntityManagerInterface $entityManager,
        ValidatorInterface     $validator,
        NotificationController $notificationController
    ): Response
    {
        // On vérifie bien que c'est une requête HTTP
        if (!$request->isXmlHttpRequest()) {
            return $this->json(['error' => 'Requête non autorisée'], Response::HTTP_BAD_REQUEST);
        }

        try {
            // Récupération des données du formulaire
            $data = $request->toArray();

            if (!$data) {
                return $this->json(['error' => 'Données invalides'], Response::HTTP_BAD_REQUEST);
            }

            // Création d'un nouvel utilisateur
            $utilisateur = new Utilisateur();

            // Création d'un formulaire sans le lier à une requête (car on utilise JSON)
            $form = $this->createForm(UtilisateurType::class, $utilisateur);

            // Soumission manuelle des données au formulaire
            $form->submit([
                'noutilisateurm' => $data['nom'],
                'prenom' => $data['prenom'],
                'email' => $data['email'],
                'password' => $data['password']
            ]);

            // Validation du formulaire (on vérifie que chaque champs est valide)
            if (!$form->isValid()) {
                $errors = [];
                foreach ($form->getErrors(true) as $error) {
                    $errors[] = $error->getMessage();
                }
                return $this->json(['error' => 'Erreurs de validation', 'details' => $errors], Response::HTTP_BAD_REQUEST);
            }

            // Vérifier si l'email existe déjà
            $existingUser = $entityManager->getRepository(Utilisateur::class)->findOneBy(['email' => $data['email']]);
            if ($existingUser) {
                return $this->json(['error' => 'Cet email est déjà utilisé'], Response::HTTP_CONFLICT);
            }

            // Si il y'a pas de mot de passe fournit on génère un mot de passe par défaut
            if ($data['password'] === "") {
                // Mot de passe composé du de la première lettre du prenom suivi du nom et de @123
                $defaultPassword = strtolower(substr($data['prenom'], 0, 1) . $data['nom'] . '@123');
                $utilisateur->setPassword($defaultPassword);
            } else {
                $utilisateur->setPassword($data['password']);
            }

            // Image de profil
            $imageName = $data['image'];
            // $imageName = $data['image'] ?? 'default.jpg';
            $utilisateur->setImage($imageName);

            // Ici on va ajouter des rôles, comme on crée des rôles on a pas besoin de vérifier les rôles existants
            if (!empty($data['roles'])) {
                foreach ($data['roles'] as $roleId) {
                    $role = $entityManager->getRepository(Role::class)->find($roleId);
                    if ($role) {
                        $utilisateur->addRole($role);
                    }
                }
            } else {
                return $this->json(['error' => 'Veuillez sélectionner au moins un rôle'], Response::HTTP_BAD_REQUEST);
            }


            // Avec persist on s'assure que ça persite
            $entityManager->persist($utilisateur);
            $entityManager->flush();

            // Ajouter les UE sélectionnées
            if (!empty($data['ues'])) {
                // Pareil dans ce cas si il y'a des UE on s'occupe uniquement de les ajouter
                foreach ($data['ues'] as $ueCode) {
                    $ue = $entityManager->getRepository(UE::class)->find($ueCode);
                    if ($ue) {
                        // Si un utilisateur est affecté on crée un nouvel enregistrement et on lui rentre les valeurs
                        $estAffecte = new EstAffecte();
                        $estAffecte->setUtilisateurId($utilisateur);
                        $estAffecte->setCodeId($ue);
                        $estAffecte->setFavori(false);
                        $entityManager->persist($estAffecte);

                        // Ici on crée une notification pour l'utilsateur, pour lui dire qu'il a été affecté à une nouvelle UE
                        $notificationController->createAffectationNotification($entityManager, $utilisateur, $ue, $this->getUser());
                    }
                }
                $entityManager->flush();
            }

            return $this->json([
                'success' => true,
                'message' => 'Utilisateur créé avec succès',
                'user' => [
                    'id' => $utilisateur->getId(),
                    'nom' => $utilisateur->getNom(),
                    'prenom' => $utilisateur->getPrenom(),
                    'email' => $utilisateur->getEmail(),
                    'image' => $utilisateur->getImage(),
                    'roles' => $utilisateur->getRoles()
                ]
            ], Response::HTTP_CREATED);

        } catch (\Exception $e) {
            return $this->json(['error' => 'Une erreur est survenue: ' . $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     *  Ici on supprime un utilisateur pour un id donnée
     * @param int $id
     * @param EntityManagerInterface $BDDManager
     * @return Response
     */
    #[Route('/admin/delete-user/{id}', name: 'admin_delete_user', methods: ['DELETE'])]
    public function deleteUser(int $id, EntityManagerInterface $BDDManager): Response
    {
        // On récupère l'utilisateur avec un id donnée
        $utilisateur = $BDDManager->getRepository(Utilisateur::class)->find($id);

        // Si l'utilisateur n'existe pas on renvoie un 'non success'
        if (!$utilisateur) {
            return $this->json(['success' => false, 'message' => 'Utilisateur introuvable'], Response::HTTP_NOT_FOUND);
        }

        // On s'occupe également de supprimer sa photo depuis le dossier
        if ($utilisateur && $utilisateur->getImage() !== 'default.jpg') {
            $oldImagePath = $this->getParameter('kernel.project_dir') . '/public/images/profil/' . $utilisateur->getImage();

            if (file_exists($oldImagePath)) {
                // Donc si un fichier existe on supprime l'image associé à l'utilisateur
                unlink($oldImagePath);
            }
        }

        // Et finalement on supprime l'utilisateur
        $BDDManager->remove($utilisateur);
        $BDDManager->flush();
        return $this->json(['success' => true], Response::HTTP_OK);
    }

    /**
     * Modifie un utilisateur existant avec Ajax et validation de formulaire
     */
    #[Route('/admin/edit-user/{id}', name: 'admin_edit_user', methods: ['PUT'])]
    public function editUser(
        Request                $request,
        EntityManagerInterface $entityManager,
        ValidatorInterface     $validator,
        int                    $id,
        NotificationController $notificationController
    ): Response
    {
        if (!$request->isXmlHttpRequest()) {
            return $this->json(['error' => 'Requête non autorisée'], Response::HTTP_BAD_REQUEST);
        }

        try {
            // Récupération des données du formulaire
            $data = $request->toArray();

            if (!$data) {
                return $this->json(['error' => 'Données invalides'], Response::HTTP_BAD_REQUEST);
            }

            // Récupération de l'utilisateur existant
            $utilisateur = $entityManager->getRepository(Utilisateur::class)->find($id);

            if (!$utilisateur) {
                return $this->json(['error' => 'Utilisateur non trouvé'], Response::HTTP_NOT_FOUND);
            }

            // Récupérer les IDs des rôles actuels pour comparaison
            $originalRoleIds = [];
            foreach ($utilisateur->getRoleObjects() as $role) {
                $originalRoleIds[] = $role->getId();
            }

            // On récupère si ils existent les rôles depuis les paramètres
            $dataRoles = $data['roles'] ?? [];

            // Ensuite on compare si il y'a des différences entre les 2 tableaux
            $rolesModified = count(array_diff($dataRoles, $originalRoleIds)) > 0 ||
                count(array_diff($originalRoleIds, $dataRoles)) > 0;


            if ($rolesModified) {
                // Supprimer tous les rôles actuels
                foreach ($utilisateur->getRoleObjects()->toArray() as $role) {
                    $utilisateur->removeRole($role);
                }

                // Ajouter les nouveaux rôles
                foreach ($dataRoles as $roleId) {
                    $role = $entityManager->getRepository(Role::class)->find($roleId);
                    if ($role) {
                        $utilisateur->addRole($role);
                    }
                }
            }

            // Même processus pour les UE
            $originalUECodes = [];
            foreach ($utilisateur->getEstAffectes() as $estAffecte) {
                if ($estAffecte->getCodeId()) {
                    $originalUECodes[] = $estAffecte->getCodeId()->getId();
                }
            }

            $dataUEs = $data['ues'] ?? [];

            // Trouver les UEs à supprimer (celles qui sont dans originalUECodes mais pas dans dataUEs)
            $uesToRemove = array_diff($originalUECodes, $dataUEs);

            // Trouver les UEs à ajouter (celles qui sont dans dataUEs mais pas dans originalUECodes)
            $uesToAdd = array_diff($dataUEs, $originalUECodes);

            // Cette fois-ci on fait une vérification bidirectionnelle pour ne pas changer la date d'affectation des UE
            // Si des modifications sont nécessaires
            if (!empty($uesToRemove) || !empty($uesToAdd)) {
                // Supprime uniquement les affectations qui ne sont plus dans la liste
                if (!empty($uesToRemove)) {
                    foreach ($utilisateur->getEstAffectes() as $estAffecte) {
                        $ueCode = $estAffecte->getCodeId()->getId();
                        if (in_array($ueCode, $uesToRemove)) {
                            $entityManager->remove($estAffecte);
                        }
                    }
                }

                // Ajoute uniquement les nouvelles affectations
                if (!empty($uesToAdd)) {
                    foreach ($uesToAdd as $ueCode) {
                        $ue = $entityManager->getRepository(UE::class)->find($ueCode);
                        if ($ue) {
                            $estAffecte = new EstAffecte();
                            $estAffecte->setUtilisateurId($utilisateur);
                            $estAffecte->setCodeId($ue);
                            $estAffecte->setFavori(false);
                            $entityManager->persist($estAffecte);

                            $notificationController->createAffectationNotification($entityManager, $utilisateur, $ue, $this->getUser());

                        }
                    }
                }
                $entityManager->flush();
            }


            // Sauvegarde des valeurs originales pour comparaison
            $originalEmail = $utilisateur->getEmail();
            $originalNom = $utilisateur->getNom();
            $originalPrenom = $utilisateur->getPrenom();
            $originalImage = $utilisateur->getImage();
            $originalPassword = $utilisateur->getPassword();

            // Création d'un formulaire sans le lier à une requête (car on utilise JSON)
            $form = $this->createForm(UtilisateurType::class, $utilisateur);

            // Soumission manuelle des données au formulaire
            $form->submit([
                'nom' => $data['nom'],
                'prenom' => $data['prenom'],
                'email' => $data['email'],
                'password' => $data['password'],
            ]);

            // Validation du formulaire
            if (!$form->isValid()) {
                $errors = [];
                foreach ($form->getErrors(true) as $error) {
                    $errors[] = $error->getMessage();
                }
                return $this->json(['error' => 'Erreurs de validation', 'details' => $errors], Response::HTTP_BAD_REQUEST);
            }

            // Vérifier si l'email existe déjà (si l'email a été modifié) -> comme c'est côté admin on part du principe que l'email peut être modfié
            if ($originalEmail !== $data['email']) {
                $existingUser = $entityManager->getRepository(Utilisateur::class)->findOneBy(['email' => $data['email']]);
                if ($existingUser && $existingUser->getId() !== $id) {
                    return $this->json(['error' => 'Cet email est déjà utilisé'], Response::HTTP_CONFLICT);
                }
            }

            // Mettre à jour l'image de profil si elle a été modifiée
            $imageName = $data['image'];
            if ($imageName !== $originalImage && $data['image'] !== "") {
                $utilisateur->setImage($imageName);
            }


            // Vérifier si des modifications ont été effectuées
            $informationsModifiees =
                $originalNom !== $data['nom'] ||
                $originalPrenom !== $data['prenom'] ||
                $originalEmail !== $data['email'] ||
                $originalImage !== $imageName ||
                $originalPassword !== $data['password'] ||
                $originalRoleIds !== $data['roles'];

            // Persister les modifications uniquement si nécessaire
            if ($informationsModifiees) {
                // Ici à l'avenir on rajoutera une notification ou quelque chose comme ça c'est pour ça qu'on a différencié
                $entityManager->flush();
                return $this->json([
                    'success' => true,
                    'message' => 'Utilisateur modifié avec succès',
                    'user' => [
                        'id' => $utilisateur->getId(),
                        'nom' => $utilisateur->getNom(),
                        'prenom' => $utilisateur->getPrenom(),
                        'email' => $utilisateur->getEmail(),
                        'image' => $utilisateur->getImage(),
                        'roles' => $utilisateur->getRoles(),
                    ]
                ], Response::HTTP_OK);
            } else {
                return $this->json([
                    'success' => true,
                    'message' => 'Aucune modification détectée',
                    'user' => [
                        'id' => $utilisateur->getId(),
                        'nom' => $utilisateur->getNom(),
                        'prenom' => $utilisateur->getPrenom(),
                        'email' => $utilisateur->getEmail(),
                        'image' => $utilisateur->getImage(),
                        'roles' => $utilisateur->getRoles()
                    ]
                ], Response::HTTP_OK);
            }

        } catch
        (\Exception $e) {
            return $this->json(['error' => 'Une erreur est survenue: ' . $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     *  Ajoute une UE avec Ajax et validation de formulaire
     * @param Request $request
     * @param EntityManagerInterface $entityManager
     * @param ValidatorInterface $validator
     * @param NotificationController $notificationController
     * @return Response
     */
    #[Route('/admin/add-ue', name: 'admin_add_ue', methods: ['POST'])]
    public function addUE(
        Request                $request,
        EntityManagerInterface $entityManager,
        ValidatorInterface     $validator,
        NotificationController $notificationController
    ): Response
    {
        if (!$request->isXmlHttpRequest()) {
            return $this->json(['error' => 'Requête non autorisée'], Response::HTTP_BAD_REQUEST);
        }

        try {
            // Comme d'habitude on extrait les données de la requête
            $data = $request->toArray();

            if (!$data) {
                return $this->json(['error' => 'Données invalides'], Response::HTTP_BAD_REQUEST);
            }


            // Pareil que les autrs méthodes on crée un nouvel objet, et on récupère les champs de la requete
            $ue = new UE();
            $id = $data['id'];
            $nom = $data['nom'];
            $responsable_id = $data['responsable_id'];
            $image = $data['image'];
            $utilisateurs = $data['utilisateurs'];


            $form = $this->createForm(UeType::class, $ue);

            $form->submit([
                'id' => $data['id'],
                'nom' => $data['nom'],
            ]);

            // On vérifie les entrées pour le schamps
            if (!$form->isValid()) {
                $errors = [];
                foreach ($form->getErrors(true) as $error) {
                    $errors[] = $error->getMessage();
                }
                return $this->json(['error' => 'Erreurs de validation', 'details' => $errors], Response::HTTP_BAD_REQUEST);
            }

            // On vérifie aussi que pour l'id, donc le code donnée n'existe pas -> car c'est à l'utilisateur de le rentrer
            $existingUE = $entityManager->getRepository(UE::class)->find($id);

            // Si il existe étant donnée que le code de l'UE est unique, on renvoie une erreur
            if ($existingUE) {
                return $this->json(['error' => 'Cette UE existe déjà'], Response::HTTP_CONFLICT);
            }

            // Sinon on initialise les attributs de notre UE
            $ue->setId($id);
            $ue->setNom($nom);
            $ue->setImage($image);
            $responsable = $entityManager->getRepository(Utilisateur::class)->find($responsable_id);
            $ue->setResponsableId($responsable);
            $entityManager->persist($ue);


            if (!empty($utilisateurs)) {
                // Ensuite étant donnée qu'on peut affecter des utilisateurs, on regardes si des utilisateurs ont été affectés et comme d'habitude on les affecte un par un
                foreach ($utilisateurs as $utilisateurId) {
                    $utilisateur = $entityManager->getRepository(Utilisateur::class)->find($utilisateurId);
                    if ($utilisateur) {
                        $estAffecte = new EstAffecte();
                        $estAffecte->setUtilisateurId($utilisateur);
                        $estAffecte->setCodeId($ue);
                        $estAffecte->setFavori(false);
                        // Ici pour la date on aurait pu faire un trigger
                        $estAffecte->setDateInscription(new \DateTime());
                        $entityManager->persist($estAffecte);

                        // Sans oublier la date d'inscription
                        $notificationController->createAffectationNotification($entityManager, $utilisateur, $ue, $this->getUser());

                    }
                }
            }

            $entityManager->flush();


            // Si tout s'est bien déroulé on renvoie les données, avec un champs succés qui nous indique que tout s'est bien déroulé
            $responseData = [
                'success' => true,
                'message' => 'UE créée avec succès',
                'ue' => [
                    'id' => $ue->getId(),
                    'nom' => $ue->getNom(),
                    'image' => $ue->getImage(),
                    'responsable' => $ue->getResponsableId(),
                    'responsable_nom' => $ue->getResponsableId()->getNom(),
                    'responsable_prenom' => $ue->getResponsableId()->getPrenom(),
                ]
            ];
            return $this->json($responseData, Response::HTTP_CREATED);

        } catch (\Exception $e) {
            return $this->json(['error' => 'Une erreur est survenue: ' . $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }

    }


    /**
     *  Upload d'image pour un utilisateur
     * @param Request $request
     * @param EntityManagerInterface $em
     * @return Response
     */
    #[Route('/admin/upload-image', name: 'admin_upload_image', methods: ['POST'])]
    public function uploadImage(Request $request, EntityManagerInterface $em): Response
    {
        try {
            // au départ on extrait toutes les données de la requête

            // Ici on récupère le fichier
            $uploadedFile = $request->files->get('file');

            // Ici on récupère l'user qui est lié à cette image ducoup
            $userId = $request->request->get('id_user');

            // dest est plutôt import car ik permet de différencier les dossiers ue des dossiers images car on utilise la même fonction pour l'upload de ces 2 types
            $dest = $request->request->get('dest');

            // Et code nous permet juste de savoir si l'image est lié à une UE
            $code = $request->request->get('code');

            // Ici on récupère le nom de l'image ainsi que son extension pour pouvoir la renommer
            $realName = $uploadedFile->getClientOriginalName();
            $extension = $uploadedFile->getClientOriginalExtension();

            // Enfaite ici on va pouvoir supprimer les anciennes images si il y'en a
            if ($userId) {
                $user = $em->getRepository(Utilisateur::class)->find($userId);

                // L'image attribué par défaut pour les utilisateurs est default.jpg, donc on vérifie que ce n'est pas cette image, que l'image est différente de la nouvelle et que c'est différent de vide
                if ($user && $user->getImage() !== 'default.jpg' && $user->getImage() !== $realName && $user->getImage() !== "") {
                    $oldImagePath = $this->getParameter('kernel.project_dir') . $dest . $user->getImage();

                    // Et dans ce cas la on enlève l'ancienne image
                    if (file_exists($oldImagePath)) {
                        unlink($oldImagePath);
                    }
                }
            }

            if ($code) {
                // Même logique que user mais cette fois ci pour l'UE
                $ue = $em->getRepository(UE::class)->find($code);

                if ($ue && $ue->getImage() !== $realName && $ue->getImage() !== 'default-ban.jpg' && $ue->getImage() !== "") {
                    $oldImagePath = $this->getParameter('kernel.project_dir') . $dest . $ue->getImage();

                    if (file_exists($oldImagePath)) {
                        unlink($oldImagePath);
                    }
                }

            }

            // Et quand tout est bon on rajoute juste l'image dans el bon répertoire
            $uploadedFile->move($this->getParameter('kernel.project_dir') . $dest, $realName);


            return $this->json([
                'success' => true,
                'image' => $realName,
                'extension' => $extension,
            ], Response::HTTP_OK);


        } catch (\Exception $e) {
            return $this->json(['success' => false], Response::HTTP_NOT_FOUND);
        }
    }

    /**
     * Ici c'est pour la popup d'UE on récupère tous les professeurs afin qu'un soit le responsable
     * @param EntityManagerInterface $em
     * @return JsonResponse
     */
    #[Route('/admin/get-responsables', name: 'admin_get_responsables')]
    public function getResponsables(EntityManagerInterface $em): JsonResponse
    {
        // Donc ici requête basique pour récupèrer tous les utilsateurs du groupe professeur
        $responsables = $em->getRepository(Utilisateur::class)
            ->createQueryBuilder('u')
            ->join('u.roles', 'r')
            ->where('r.id = :id')
            ->setParameter('id', 2)
            ->getQuery()
            ->getResult();

        // On renvoie les utilisateurs sous forme d'un tableau JSON avec id et nom
        $response = [];
        foreach ($responsables as $responsable) {
            $response[] = [
                'id' => $responsable->getId(),
                'name' => $responsable->getNom() . ' ' . $responsable->getPrenom(),
            ];
        }

        return new JsonResponse($response);
    }

    /**
     * Ici on récupère élève et professeur pour les affecter à des UE
     * @param EntityManagerInterface $em
     * @return JsonResponse
     */
    #[Route('/admin/get-utilisateurs-affectable', name: 'admin_get_utilisateurs-affectable')]
    public function getUtilisateurAffectable(EntityManagerInterface $em): JsonResponse
    {
        // On récupère tous les utilsiateurs du groupe 1 et 2
        $utilisateurs = $em->getRepository(Utilisateur::class)
            ->createQueryBuilder('u')
            ->join('u.roles', 'r')
            ->where('r.id = :id OR r.id = :id2')
            ->setParameter('id', 2)
            ->setParameter('id2', 3)
            ->getQuery()
            ->getResult();

        // Et comme précédemment on on renvoie dans un tableau
        $response = [];
        foreach ($utilisateurs as $utilisateur) {
            $response[] = [
                'id' => $utilisateur->getId(),
                'nom' => $utilisateur->getNom() . ' ' . $utilisateur->getPrenom(),
            ];
        }

        return new JsonResponse($response);
    }

    /**
     * Ici on récupère toutes les UE
     * @param EntityManagerInterface $em
     * @return JsonResponse
     */
    #[Route('/admin/get-ue', name: 'admin_get_ue', methods: ['GET'])]
    public function getUe(EntityManagerInterface $em): JsonResponse
    {
        $ues = $em->getRepository(UE::class)->findAll();

        $response = [];

        // Comme d'habitude on met ça dans un tableau
        foreach ($ues as $ue) {
            $response[] = [
                'code' => $ue->getId(),
                'nom' => $ue->getNom()
            ];
        }

        return new JsonResponse($response);
    }

    /**
     * Cette Ue sert notamment pour le edit pour récupèrer les informations d'une UE
     * @param EntityManagerInterface $repo
     * @param string $id
     * @return JsonResponse
     * @throws \Doctrine\DBAL\Exception
     */
    #[Route('/admin/get-one-ue/{id}', name: 'admin_get_one_ue', methods: ['GET'])]
    public function getUeById(EntityManagerInterface $repo, string $id): JsonResponse
    {
        // Cette fois ci on reformule une requête SQL
        $connection = $repo->getConnection();

        $ue = $repo->getRepository(UE::class)->find($id);

        // Dons on sélectionne tous les utilisateurs affectés à une UE
        $sql = 'SELECT u.id_utilisateur as id , u.nom as nom, u.prenom as prenom
                FROM Est_affecte e
                INNER JOIN Utilisateur u ON u.id_utilisateur = e.utilisateur_id
                WHERE code_id= :id;';

        $affectations = $connection->prepare($sql)->executeQuery(['id' => $id])->fetchAllAssociative();

        // Et on renvoie toutes les données
        $response = [
            'code' => $ue->getId(),
            'nom' => $ue->getNom(),
            'responsable_id' => $ue->getResponsableId()?->getId(),
            'responsable_nom' => $ue->getResponsableId()?->getNom() . ' ' . $ue->getResponsableId()?->getPrenom(),
            'image' => $ue->getImage(),
            'utilisateurs_affectes' => $affectations,
        ];

        return $this->json(['error' => false, 'ue' => $response], Response::HTTP_OK);
    }

    /**
     * Modifie une ue donnée
     * @param Request $request
     * @param EntityManagerInterface $entityManager
     * @param string $id
     * @param NotificationController $notificationController
     * @return Response
     */
    #[Route('/admin/edit-ue/{id}', name: 'admin_edit_ue', methods: ['PUT'])]
    public function editUE(
        Request                $request,
        EntityManagerInterface $entityManager,
        string                 $id,
        NotificationController $notificationController
    ): Response
    {
        if (!$request->isXmlHttpRequest()) {
            return $this->json(['error' => 'Requête non autorisée'], Response::HTTP_BAD_REQUEST);
        }

        try {
            // Récupération des données du formulaire
            $data = $request->toArray();

            if (!$data) {
                return $this->json(['error' => 'Données invalides'], Response::HTTP_BAD_REQUEST);
            }

            // Récupération de l'ue existante
            $ue = $entityManager->getRepository(UE::class)->find($id);

            if (!$ue) {
                return $this->json(['error' => 'Utilisateur non trouvé'], Response::HTTP_NOT_FOUND);
            }

            // Maintenant inverse de utilisateur, cette fois-ci on vérifie si des utilisateurs sont données
            $dataUEs = $data['utilisateurs'] ?? [];

            // Cette variable nous permet de savoir si un utilisateur a été affecté, c'est juste pour savoir si il y'a des modifs
            $originalUser = false;

            // Récupérer les codes des UEs actuelles
            $originalUECodes = [];
            foreach ($ue->getEstAffectes() as $estAffecte) {
                if ($estAffecte->getUtilisateurId()->getId()) {
                    $originalUECodes[] = $estAffecte->getUtilisateurId()->getId();
                }
            }

            // Ici on met également les UE qui ne sont plus dans le tableau afin de les supprimer
            $uesToRemove = array_diff($originalUECodes, $dataUEs);
            // Dans le cas ou j'envoie un tableau vide il faut quand même supprimer toutes les UE
            if (empty($dataUEs) && !empty($originalUECodes)) {
                $uesToRemove = $originalUECodes;
            }

            // Ici comme pour tout a l'heure on vérifie les ue a ajouter
            $uesToAdd = array_diff($dataUEs, $originalUECodes)
            ;
            if (!empty($uesToRemove) || !empty($uesToAdd)) {
                // un changement est donc detecté
                $originalUser = true;
                if (!empty($uesToRemove)) {
                    foreach ($ue->getEstAffectes() as $estAffecte) {
                        $idUtilisateur = $estAffecte->getUtilisateurId()->getId();
                        if (in_array($idUtilisateur, $uesToRemove)) {
                            // une ue est absente on la supprime
                            $entityManager->remove($estAffecte);
                        }
                    }
                }
                if (!empty($uesToAdd)) {
                    foreach ($uesToAdd as $idUtilisateur) {
                        $utilisateur = $entityManager->getRepository(Utilisateur::class)->find($idUtilisateur);
                        if ($ue) {
                            // Ici on ajouteles UE manquantes
                            $estAffecte = new EstAffecte();
                            $estAffecte->setUtilisateurId($utilisateur);
                            $estAffecte->setCodeId($ue);
                            $estAffecte->setFavori(false);
                            $entityManager->persist($estAffecte);

                            // Comme d'habitude on envoie la notification
                            $notificationController->createAffectationNotification($entityManager, $utilisateur, $ue, $this->getUser());

                        }
                    }
                }
                $entityManager->flush();
            }


            // Ensite on récupère les champs
            $originalCode = $ue->getId();
            $originalNom = $ue->getNom();
            $orginalResponsable = $ue->getResponsableId()->getId();
            $originalImage = $ue->getImage();


            // Création d'un formulaire sans le lier à une requête (car on utilise JSON)
            $form = $this->createForm(UeType::class, $ue);

            // Soumission manuelle des données au formulaire
            $form->submit([
                'id' => $data['id'],
                'nom' => $data['nom']
            ]);

            // Validation du formulaire
            if (!$form->isValid()) {
                $errors = [];
                foreach ($form->getErrors(true) as $error) {
                    $errors[] = $error->getMessage();
                }
                return $this->json(['error' => 'Erreurs de validation', 'details' => $errors], Response::HTTP_BAD_REQUEST);
            }


            // Initialement on pouvait modifié le code de l'UE mais plus maintenant, c'était une sorte de vérification
            if ($originalCode !== $data['id']) {
                $existingUE = $entityManager->getRepository(UE::class)->find($data['id']);
                if ($existingUE && $existingUE->getId() !== $id) {
                    return $this->json(['error' => 'Ce code UE est déjà utilisé'], Response::HTTP_CONFLICT);
                } else {
                    $ue->setId($data['id']);
                }
            }

            // Mettre à jour l'image de profil si elle a été modifiée
            $imageName = $data['image'];
            // $imageName = $data['image'] ?? 'default-ban.jpg';

            // Si les champs varient, on les met à jour
            if ($imageName !== $originalImage && $imageName !== "") {
                $ue->setImage($imageName);
            }

            if ($originalNom !== $data['nom']) {
                $ue->setNom($data['nom']);
            }
            if ($orginalResponsable !== $data['responsable_id']) {
                $responsable = $entityManager->getRepository(Utilisateur::class)->find($data['responsable_id']);
                $ue->setResponsableId($responsable);
            }


            // Vérifier si des modifications ont été effectuées
            $informationsModifiees =
                $originalCode !== $data['id'] ||
                $originalNom !== $data['nom'] ||
                $orginalResponsable !== $data['responsable_id'] ||
                $originalUser;


            // Persister les modifications uniquement si nécessaire
            if ($informationsModifiees) {
                $entityManager->flush();
                return $this->json([
                    'success' => true,
                    'message' => 'Utilisateur modifié avec succès',
                    'ue' => [
                        'id' => $ue->getId(),
                        'nom' => $ue->getNom(),
                        'image' => $ue->getImage(),
                        'responsable' => $ue->getResponsableId(),
                        'responsable_nom' => $ue->getResponsableId()->getNom(),
                        'responsable_prenom' => $ue->getResponsableId()->getPrenom(),
                    ]
                ], Response::HTTP_OK);
            } else {
                return $this->json([
                    'success' => true,
                    'message' => 'Aucune modification détectée',
                    'ue' => [
                        'id' => $ue->getId(),
                        'nom' => $ue->getNom(),
                        'image' => $ue->getImage(),
                        'responsable' => $ue->getResponsableId(),
                        'responsable_nom' => $ue->getResponsableId()->getNom(),
                        'responsable_prenom' => $ue->getResponsableId()->getPrenom(),
                    ]
                ], Response::HTTP_OK);
            }
        } catch
        (\Exception $e) {
            return $this->json(['error' => 'Une erreur est survenue: ' . $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    /**
     * Ici on supprime une UE
     * @param string $code
     * @param EntityManagerInterface $BDDManager
     * @return Response
     */
    #[Route('/admin/delete-ue/{code}', name: 'admin_delete_ue', methods: ['DELETE'])]
    public function deleteUE(string $code, EntityManagerInterface $BDDManager): Response
    {
        $ue = $BDDManager->getRepository(UE::class)->find($code);

        // Si l'ue n'existe pas on renvoie une erreur
        if (!$ue) {
            return $this->json(['success' => false, 'message' => 'UE introuvable'], Response::HTTP_NOT_FOUND);
        }

        if ($ue && $ue->getImage() !== 'default-ban.jpg') {
            $oldImagePath = $this->getParameter('kernel.project_dir') . '/public/images/ue/' . $ue->getImage();

            if (file_exists($oldImagePath)) {
                unlink($oldImagePath);
            }
        }

        $BDDManager->remove($ue);
        $BDDManager->flush();
        return $this->json(['success' => true], Response::HTTP_OK);
    }

    /**
     * L'admin peut modifier également une UE donc on le renvoie sur la page
     * @param string $codeUe
     * @param EntityManagerInterface $BDDManager
     * @return Response
     * @throws \Doctrine\DBAL\Exception
     */
    #[Route('/admin/contenu_ue-{codeUe}', name: 'contenu_ue_admin')]
    public function contenuUe(string $codeUe, EntityManagerInterface $BDDManager): Response
    {
        // Cette page nécessite beaucoup d'informations
        $user = $this->getUser();

        $roles = $user->getRoles();

        $ue = $BDDManager->getRepository(Ue::class)->findOneBy(['id' => $codeUe]);

        $connection = $BDDManager->getConnection();

        // recuperation du nb deleves dans lue
        $sql_nb_eleves_dans_ue = '
                SELECT COUNT(est_affecte.utilisateur_id) AS number
                FROM ue
                INNER JOIN est_affecte ON est_affecte.code_id = ue.code
                INNER JOIN utilisateur ON utilisateur.id_utilisateur = est_affecte.utilisateur_id
                INNER JOIN possede ON possede.utilisateur_id = utilisateur.id_utilisateur
                WHERE ue.code = :codeUe AND possede.role_id = 3
                ';

        $prepareSQL = $connection->prepare($sql_nb_eleves_dans_ue);
        $resultat = $prepareSQL->executeQuery(['codeUe' => $codeUe]);
        $nb_eleves_ue = $resultat->fetchOne();

        // recupereation de la liste des eleves

        $sql_liste_eleves_dans_ue = '
                SELECT utilisateur.nom, utilisateur.prenom, utilisateur.email, utilisateur.image
                FROM ue
                INNER JOIN est_affecte ON est_affecte.code_id = ue.code
                INNER JOIN utilisateur ON utilisateur.id_utilisateur = est_affecte.utilisateur_id
                INNER JOIN possede ON possede.utilisateur_id = utilisateur.id_utilisateur
                WHERE ue.code = :codeUe AND possede.role_id = 3
                ';

        $prepareSQL = $connection->prepare($sql_liste_eleves_dans_ue);
        $resultat = $prepareSQL->executeQuery(['codeUe' => $codeUe]);
        $liste_eleves_ue = $resultat->fetchAllAssociative();

        // recuperation du nombre denseignants
        $sql_nb_profs_dans_ue = '
                SELECT COUNT(est_affecte.utilisateur_id) AS number
                FROM ue
                INNER JOIN est_affecte ON est_affecte.code_id = ue.code
                INNER JOIN utilisateur ON utilisateur.id_utilisateur = est_affecte.utilisateur_id
                INNER JOIN possede ON possede.utilisateur_id = utilisateur.id_utilisateur
                WHERE ue.code = :codeUe AND possede.role_id = 2
                ';

        $prepareSQL = $connection->prepare($sql_nb_profs_dans_ue);
        $resultat = $prepareSQL->executeQuery(['codeUe' => $codeUe]);
        $nb_profs_ue = $resultat->fetchOne();


        // recupereation de la liste des enseignants

        $sql_liste_profs_dans_ue = '
                SELECT utilisateur.nom, utilisateur.prenom, utilisateur.email, utilisateur.image
                FROM ue
                INNER JOIN est_affecte ON est_affecte.code_id = ue.code
                INNER JOIN utilisateur ON utilisateur.id_utilisateur = est_affecte.utilisateur_id
                INNER JOIN possede ON possede.utilisateur_id = utilisateur.id_utilisateur
                WHERE ue.code = :codeUe AND possede.role_id = 2
                ';

        $prepareSQL = $connection->prepare($sql_liste_profs_dans_ue);
        $resultat = $prepareSQL->executeQuery(['codeUe' => $codeUe]);
        $liste_profs_ue = $resultat->fetchAllAssociative();


        // recuperation de la liste des sections
        $sql_sections_ue = '
                SELECT id_section as id, nom
                FROM section
                WHERE code_id = :codeUe
                ';

        $prepareSQL = $connection->prepare($sql_sections_ue);
        $resultat = $prepareSQL->executeQuery(['codeUe' => $codeUe]);
        $sections_ue = $resultat->fetchAllAssociative();


        // recuperation de la lsite des postes
        $sql_liste_publications = '
                SELECT id_publication as id, titre, description, contenu_texte, contenu_fichier, derniere_modif, ordre, visible, section_id, utilisateur_id, type_publication_id, code_id
                FROM publication
                WHERE code_id = :codeUe
                ORDER BY section_id ASC, ordre ASC 
                ';


        $prepareSQL = $connection->prepare($sql_liste_publications);
        $resultat = $prepareSQL->executeQuery(['codeUe' => $codeUe]);
        $liste_publications = $resultat->fetchAllAssociative();


        $queryEpingle = $BDDManager->createQuery(
            'SELECT p
     FROM App\Entity\Publication p
     JOIN App\Entity\Utilisateur u WITH p.utilisateur_id = u.id
     JOIN App\Entity\Epingle e WITH p.id = e.publication_id
     WHERE p.code_id = :codeUe'
        )->setParameter('codeUe', $codeUe);


        $publicationsEpingles = $queryEpingle->getResult();

        // Passer l'ID de l'utilisateur explicitement
        foreach ($publicationsEpingles as &$publication) {
            $publication->utilisateur_id_id = $publication->getUtilisateurId()->getId();
            $publication->utilisateur_id_nom = $publication->getUtilisateurId()->getNom();
            $publication->utilisateur_id_prenom = $publication->getUtilisateurId()->getPrenom();
        }


        foreach ($publicationsEpingles as &$publication) {
            $publication->getDerniereModif()->format('d/m/Y H:i');
        }

        // dd($publicationsEpingles);


        return $this->render('contenue-ue/contenu_ue.html.twig', [
            'controller_name' => 'AdminController',
            'ue' => $ue,
            'nb_eleves_ue' => $nb_eleves_ue,
            'nb_profs_ue' => $nb_profs_ue,
            'liste_eleves_ue' => $liste_eleves_ue,
            'liste_profs_ue' => $liste_profs_ue,
            'sections_ue' => $sections_ue,
            'liste_publications' => $liste_publications,
            'publicationsEpingles' => $publicationsEpingles,
            'roles' => $roles,
            'utilisateur' => $user,
        ]);
    }


}
