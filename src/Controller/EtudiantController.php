<?php

namespace App\Controller;

use App\Entity\Notification;
use App\Entity\UE;
use App\Entity\Utilisateur;
use App\Form\UserProfileType;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

final class EtudiantController extends AbstractController
{
    #[Route('/etudiant', name: 'app_etudiant')]
    public function index(EntityManagerInterface $BDDManager, NotificationController $notificationController, Request $request): Response
    {
        $session = $request->getSession();
        $session->set('vue_active', 'etudiant');

        $user = $this->getUser();
        if (!$user) {
            return $this->redirectToRoute('app_login');
        }

        $connection = $BDDManager->getConnection();

        // Récupérer les UE
        $sqlUe = '
            SELECT ue.code, ue.nom, ue.image,
                   u.nom AS nom_responsable, u.prenom, est_affecte.favori
            FROM ue
            INNER JOIN est_affecte ON est_affecte.code_id = ue.code
            INNER JOIN utilisateur u ON u.id_utilisateur = ue.responsable_id
            WHERE est_affecte.utilisateur_id = :user_id
        ';
        $ues = $connection->executeQuery($sqlUe, ['user_id' => $user->getId()])->fetchAllAssociative();

        // Récupérer les premières notifications
        $notificationsData = $notificationController->getNotificationsData($BDDManager, $user->getId(), 0, 4);

        return $this->render('choix_ue/choix_ue.html.twig', [
            'controller_name' => 'EtudiantController',
            'user' => $user,
            'ues' => $ues,
            'roles' => $this->getUser()->getRoles(),
            'utilisateur' => $this->getUser(),
            'notifications' => $notificationsData['notifications'],
            'showMoreButton' => $notificationsData['hasMore'],
        ]);
    }

    #[Route('/etudiant/contenu_ue-{codeUe}', name: 'contenu_ue_etudiant')]
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

    #[Route('/etudiant/profil', name: 'etudiant_profil')]
    public function profile(EntityManagerInterface $BDDManager, Request $request): Response
    {
        $utilisateur = $BDDManager->getRepository(Utilisateur::class)->findOneBy(["email" => $this->getUser()->getUserIdentifier()]);
        $roles = $utilisateur->getRoles();

        $nouvelUtilisateur = new Utilisateur();
        $form = $this->createForm(UserProfileType::class, $nouvelUtilisateur);
        $form->handleRequest($request);


        return $this->render('profil/profil.html.twig', [
            'controller_name' => 'EtudiantController',
            'utilisateur' => $utilisateur,
            'roles' => $roles,
            'form' => $form->createView(),
        ]);
    }


}
