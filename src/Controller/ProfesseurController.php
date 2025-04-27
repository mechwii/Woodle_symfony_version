<?php

namespace App\Controller;

use App\Entity\Epingle;
use App\Entity\Publication;
use App\Form\PublicationType;
use App\Form\SectionType;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Form\Extension\Core\Type\HiddenType;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

// On ajoute le bon repo
use App\Repository\UERepository;
use App\Repository\EstAffecteRepository;

use App\Entity\UE;
use App\Entity\Utilisateur;
use App\Entity\Section;
use Doctrine\ORM\EntityManagerInterface;
use Twig\Environment;

final class ProfesseurController extends AbstractController
{
    // Crééation de la route pour arriver sur la page Choix_UE apres le login
    #[Route('/professeur', name: 'app_professeur')]
    public function index(EntityManagerInterface $BDDManager, NotificationController $notificationController, Request $request): Response
    {

        $session = $request->getSession();
        $session->set('vue_active', 'professeur');

        $user = $this->getUser();
        if (!$user) {
            return $this->redirectToRoute('app_login');
        }

        $roles = $user->getRoles();

        $connection = $BDDManager->getConnection();

        // Récupérer les UE
        $sqlUe = '
            SELECT ue.code, ue.nom, ue.image,
                   u.nom AS nom_responsable, u.prenom, est_affecte.favori
            FROM ue
            INNER JOIN est_affecte ON est_affecte.code_id = ue.code
            INNER JOIN utilisateur u ON u.id_utilisateur = est_affecte.utilisateur_id
            WHERE est_affecte.utilisateur_id = :user_id
        ';
        $ues = $connection->executeQuery($sqlUe, ['user_id' => $user->getId()])->fetchAllAssociative();

        // Récupérer les premières notifications
        $notificationsData = $notificationController->getNotificationsData($BDDManager, $user->getId(), 0, 4);

        return $this->render('choix_ue/choix_ue.html.twig', [
            'controller_name' => 'AdminController',
            'user' => $user,
            'ues' => $ues,
            'roles' => $roles,
            'utilisateur' => $this->getUser(),
            'notifications' => $notificationsData['notifications'],
            'showMoreButton' => $notificationsData['hasMore'],
        ]);
    }

    #[Route('/professeur/contenu_ue-{codeUe}', name: 'contenu_ue_professeur')]
    public function contenuUe(string $codeUe, EntityManagerInterface $BDDManager): Response
    {
        // Récupération du prof connecté
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
        $sections_ue= $resultat->fetchAllAssociative();


        // recuperation de la lsite des postes
        $sql_liste_publications = '
                SELECT id_publication as id, titre, description, contenu_texte, contenu_fichier, derniere_modif, ordre, visible, section_id, utilisateur_id, type_publication_id, code_id
                FROM publication
                WHERE code_id = :codeUe
                ';

        $prepareSQL = $connection->prepare($sql_liste_publications);
        $resultat = $prepareSQL->executeQuery(['codeUe' => $codeUe]);
        $liste_publications= $resultat->fetchAllAssociative();


        $queryEpingle = $BDDManager->createQuery(
            'SELECT p
                 FROM App\Entity\Publication p
                JOIN App\Entity\Epingle e WITH p.id = e.publication_id
                WHERE p.code_id = :codeUe'
        )->setParameter('codeUe', $codeUe);



        $publicationsEpingles = $queryEpingle->getResult();

//        dd($publicationsEpingles);


        return $this->render('contenue-ue/contenu_ue.html.twig', [
            'controller_name' => 'ProfesseurController',
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

//    ICI ROUTES POUR SECTION
//    Route pour la modification d'une section
    #[Route('/professeur/contenu_ue-{codeUe}/section/{id}/edit', name: 'section_edit', methods: ['GET', 'POST'])]
    public function editSection(string $codeUe, Section $section, Request $request, EntityManagerInterface $entityManager) {


        $form = $this->createForm(SectionType::class, $section);
        $form->handleRequest($request);
        if ($form->isSubmitted() && $form->isValid()) {

            $entityManager->flush();

            return new JsonResponse([
                'status' => 'success',
                'section_id' => $section->getId(),
                'section_nom' => $section->getNom(),
            ]);
        }

        // Si GET ou erreur dans le form
        return new JsonResponse([
            'status' => 'form',
            'html' => $this->renderView('contenue-ue/edit_section.html.twig', [
                'form' => $form->createView(),
                'section' => $section,
            ])
        ]);

    }

    // Création d'une section

    #[Route('/professeur/contenu_ue-{codeUe}/section/create', name: 'section_create', methods: ['GET', 'POST'])]
    public function createSection(string $codeUe, Request $request, EntityManagerInterface $entityManager, EntityManagerInterface $BDDManager)
    {
        // récupération de l'entité UE correspondant au codeUe
        $ue = $BDDManager->getRepository(UE::class)->findOneBy(['id' => $codeUe]);

        if (!$ue) {
            throw $this->createNotFoundException('UE non trouvée pour le code : ' . $codeUe);
        }

// création d'une section vide
        $section = new Section();
        $section->setCodeId($ue);

        $connection = $BDDManager->getConnection();


        // recuperation de la lsite des postes
        $sql_liste_publications = '
                SELECT titre, description, contenu_texte, contenu_fichier, derniere_modif, ordre, visible, section_id, utilisateur_id, type_publication_id, code_id
                FROM publication
                WHERE code_id = :codeUe
                ';

        $prepareSQL = $connection->prepare($sql_liste_publications);
        $resultat = $prepareSQL->executeQuery(['codeUe' => $codeUe]);
        $liste_publications= $resultat->fetchAllAssociative();


        $form = $this->createForm(SectionType::class, $section);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $entityManager->persist($section);
            $entityManager->flush();


            return new JsonResponse([
                'status' => 'success',
                'section_id' => $section->getId(),
                'section_nom' => $section->getNom(),
                'html' => $this->renderView('contenue-ue/partials/_section.html.twig', [
                    'section' => $section,
                    'liste_publications' => $liste_publications,
                ])
            ]);

//            return $this->redirectToRoute('contenu_ue_professeur', ['codeUe' => $codeUe]);
        }

//        return $this->render('professeur/create_section.html.twig', [



        // Si GET ou erreur dans le form
        return new JsonResponse([
            'status' => 'form',
            'html' => $this->renderView('contenue-ue/create_section.html.twig', [
                'form' => $form->createView(),
                'section' => $section,
            ])
        ]);

    }

    // supprimer une section
    #[Route('/professeur/contenu_ue-{codeUe}/section/{id}/delete', name: 'delete_section', methods: ['DELETE'])]
    public function deleteSection(Section $section, EntityManagerInterface $entityManager) {

        $entityManager->remove($section);
        $entityManager->flush();

        return new JsonResponse([
            'status' => 'success',
        ]);
    }

//ICI ROUTES POUR PUBLICATION

// EDITER UNE PUBLICATION
    #[Route('/professeur/contenu_ue-{codeUe}/section/{id_section}/publication/{id_publication}/edit', name: 'publication_edit', methods: ['GET', 'POST'])]
    public function editPublication(int $id_publication, Request $request, EntityManagerInterface $entityManager) {

        $publication = $entityManager->getRepository(Publication::class)->find($id_publication);
        $type = $request->query->get('type', 'texte'); // 'texte' par défaut

        if (!$publication) {
            throw $this->createNotFoundException('Publication non trouvée.');
        }

        $form = $this->createForm(PublicationType::class, $publication);
        $form->add('type', HiddenType::class, [
            'mapped' => false,
            'data' => $type,
        ]);
        $form->handleRequest($request);
        if ($form->isSubmitted() && $form->isValid()) {
            $publication->setDerniereModif(new \DateTimeImmutable());

            $contenuFichier = $form->get('contenuFichier')->getData();
            if ($contenuFichier) {
                // Traitez l'upload du fichier ici (par exemple en utilisant un service)
                $fileName = $contenuFichier->getClientOriginalName();
                $contenuFichier->move($this->getParameter('kernel.project_dir') . '/public/uploads', $fileName);
                $publication->setContenuFichier($fileName);
            }

            $entityManager->flush();

            return new JsonResponse([
                'status' => 'success',
                'id' => $publication->getId(),
                'titre' => $publication->getTitre(),
                'description' => $publication->getDescription(),
                'contenu_texte' => $publication->getContenuTexte(),
                'contenu_fichier' => $publication->getContenuFichier(),
                'derniere_modif' => $publication->getDerniereModif()->format('d/m/Y H:i'),
                'ordre' => $publication->getOrdre(),
                'visible' => $publication->isVisible(),
                'section_id' => $publication->getSectionId(),
                'utilisateur_id' => $publication->getUtilisateurId(),
                'type_publication_id' => $publication->getTypePublicationId()->getId(), // ou ->getTypePublication()->getId() selon ton entité
                'code_id' => $publication->getCodeId(),
            ]);

        }

        // Si GET ou erreur dans le form
        return new JsonResponse([
            'status' => 'form',
            'html' => $this->renderView('contenue-ue/edit_publication.html.twig', [
                'form' => $form->createView(),
                'publication' => $publication,
            ])
        ]);

    }

    // créer une publication

    #[Route('/professeur/contenu_ue-{codeUe}/section/{id_section}/publication/create', name: 'publication_create', methods: ['GET', 'POST'])]
    public function createPublication(Request $request, EntityManagerInterface $entityManager, string $codeUe, int $id_section, NotificationController $notificationController)

    {

        // récupération de l'entité UE correspondant au codeUe
        $ue_post = $entityManager->getRepository(UE::class)->findOneBy(['id' => $codeUe]);
        // Récupération du prof connecté
        $user_post = $this->getUser();

        // récupération de la section id
        $section_post  = $entityManager->getRepository(Section::class)->findOneBy(['id' => $id_section]);


        // création d'une publication vide
        $publication = new Publication();
        $publication->setCodeId($ue_post);
        $publication->setUtilisateurId($user_post);
        $publication->setSectionId($section_post);
        $publication->setDerniereModif(new \DateTimeImmutable());



        // Récupérer le type de contenu depuis l'URL (ou paramètre GET)

        // Créer le formulaire de publication
        $type = $request->query->get('type', 'texte');

        $form = $this->createForm(PublicationType::class, $publication);
        $form->add('type', HiddenType::class, [
            'mapped' => false,
            'data' => $type,
        ]);
        $form->handleRequest($request);

        // Si le formulaire est soumis et valide
        if ($form->isSubmitted() && $form->isValid()) {


                $contenuFichier = $form->get('contenuFichier')->getData();
                if ($contenuFichier) {
                    // Traitez l'upload du fichier ici (par exemple en utilisant un service)
                    $fileName = $contenuFichier->getClientOriginalName();
                    $contenuFichier->move($this->getParameter('kernel.project_dir') . '/public/uploads', $fileName);
                    $publication->setContenuFichier($fileName);
                }

            // Enregistrer la publication dans la base de données
            $entityManager->persist($publication);
            $entityManager->flush();
            $notificationController->createAjoutPublicationNotification($entityManager, $ue_post, $this->getUser(), $publication->getTypePublicationId()->getId(), $publication);



            return new JsonResponse([
                'status' => 'success',
                'id' => $publication->getId(),
                'titre' => $publication->getTitre(),
                'description' => $publication->getDescription(),
                'contenuTexte' => $publication->getContenuTexte(),
                'contenuFichier' => $publication->getContenuFichier(),
                'derniere_modif' => $publication->getDerniereModif()->format('d/m/Y H:i'),
                'ordre' => $publication->getOrdre(),
                'visible' => $publication->isVisible(),
                'section_id' => $publication->getSectionId()?->getId(),
                'utilisateur_id' => $publication->getUtilisateurId()?->getId(),
                'type_publication_id' => $publication->getTypePublicationId()?->getId(),
                'code_id' => $publication->getCodeId()?->getId(),
                'html' => $this->renderView('contenue-ue/partials/_publication.html.twig', [
                    'id' => $publication->getId(),
                    'titre' => $publication->getTitre(),
                    'description' => $publication->getDescription(),
                    'contenuTexte' => $publication->getContenuTexte(),
                    'contenuFichier' => $publication->getContenuFichier(),
                    'derniere_modif' => $publication->getDerniereModif()->format('d/m/Y H:i'),
                    'ordre' => $publication->getOrdre(),
                    'visible' => $publication->isVisible(),
                    'section_id' => $publication->getSectionId()?->getId(),
                    'utilisateur_id' => $publication->getUtilisateurId()?->getId(),
                    'type_publication_id' => $publication->getTypePublicationId()?->getId(),
                    'code_id' => $publication->getCodeId()?->getId(),
                ])
            ]);
        }

        // Si le formulaire est GET ou qu'il y a une erreur, on renvoie le formulaire avec les données
        return new JsonResponse([
            'status' => 'form',
            'html' => $this->renderView('contenue-ue/create_publication.html.twig', [
                'form' => $form->createView(),
                'publication' => $publication,
                'type' => $type,
            ])
        ]);
    }




    // SUPPRIMER UNE PUBLICATION

    #[Route('/professeur/contenu_ue-{codeUe}/section/{id_section}/publication/{id_publication}/delete', name: 'delete_publication', methods: ['GET'])]
    public function deletePublication($id_publication, EntityManagerInterface $entityManager): JsonResponse
    {


        $publication = $entityManager->getRepository(Publication::class)->find($id_publication);

        if (!$publication) {
            return new JsonResponse(['status' => 'error', 'message' => 'Publication introuvable'], 404);
        }

        $entityManager->remove($publication);
        $entityManager->flush();

        return new JsonResponse(['status' => 'success']);
    }

//    Route pour épingler les publications
    #[Route('/professeur/contenu_ue-{codeUe}/publication/{id}/epingle', name: 'publication_epingle', methods: ['POST'])]
    public function epinglePublication(
        Request $request,
        Publication $publication,
        EntityManagerInterface $entityManager
    ): JsonResponse
    {
        $user = $this->getUser(); // récupère l'utilisateur connecté

        if (!$user) {
            return new JsonResponse(['status' => 'error', 'message' => 'Non connecté'], 401);
        }

        $epingle = new Epingle();
        $epingle->setPublicationId($publication);
        $epingle->setUtilisateurId($user);
        $epingle->setDateEpingle(new \DateTimeImmutable());

        $entityManager->persist($epingle);
        $entityManager->flush();

        return new JsonResponse(['status' => 'success']);
    }

// Route pour désépingler un post
    #[Route('/professeur/contenu_ue-{codeUe}/publication/{id}/desepingle', name: 'publication_desepingle', methods: ['POST'])]
    public function desepinglePublication(
        Request $request,
        Publication $publication,
        EntityManagerInterface $entityManager
    ): JsonResponse
    {
        $user = $this->getUser();

        if (!$user) {
            return new JsonResponse(['status' => 'error', 'message' => 'Non connecté'], 401);
        }

        // Chercher l'épingle existante
        $epingle = $entityManager->getRepository(Epingle::class)->findOneBy([
            'publication_id' => $publication,
            'utilisateur_id' => $user,
        ]);

        if ($epingle) {
            $entityManager->remove($epingle);
            $entityManager->flush();
        }

        return new JsonResponse(['status' => 'success']);
    }

}
