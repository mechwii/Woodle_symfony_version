<?php

namespace App\Controller;

use App\Form\SectionType;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
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
    public function index(EntityManagerInterface $BDDManager): Response
    {

        // récupération du prof connecté
        $user = $this->getUser();

        $connection = $BDDManager->getConnection();

        $sql = '
                SELECT ue.code, ue.nom, ue.description, ue.semestre, ue.image,
                       u.nom AS nom_responsable, u.prenom, est_affecte.favori
                FROM ue
                INNER JOIN est_affecte ON est_affecte.code_id = ue.code
                INNER JOIN utilisateur u ON u.id_utilisateur = est_affecte.utilisateur_id
                WHERE est_affecte.utilisateur_id = :user_id
                ';

        $prepareSQL = $connection->prepare($sql);
        $resultat = $prepareSQL->executeQuery(['user_id' => $user->getId()]);

        $ues = $resultat->fetchAllAssociative();


        return $this->render('professeur/index.html.twig', [
            'controller_name' => 'ProfesseurController',
            'user' => $user,
            'ues' => $ues,
        ]);
    }

    #[Route('/professeur/contenu_ue-{codeUe}', name: 'contenu_ue_professeur')]
    public function contenuUe(string $codeUe, EntityManagerInterface $BDDManager): Response
    {
        // Récupération du prof connecté
        $user = $this->getUser();

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
                SELECT titre, description, contenu, derniere_modif, ordre, visible, section_id, utilisateur_id, type_publication_id, code_id
                FROM publication
                WHERE code_id = :codeUe
                ';

        $prepareSQL = $connection->prepare($sql_liste_publications);
        $resultat = $prepareSQL->executeQuery(['codeUe' => $codeUe]);
        $liste_publications= $resultat->fetchAllAssociative();

        /*insert epingle
        insert type_publication
        */
//        insert publication

        return $this->render('professeur/contenu_ue.html.twig', [
            'controller_name' => 'ProfesseurController',
            'ue' => $ue,
            'nb_eleves_ue' => $nb_eleves_ue,
            'nb_profs_ue' => $nb_profs_ue,
            'liste_eleves_ue' => $liste_eleves_ue,
            'liste_profs_ue' => $liste_profs_ue,
            'sections_ue' => $sections_ue,
            'liste_publications' => $liste_publications,
        ]);
    }

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
            'html' => $this->renderView('professeur/edit_section.html.twig', [
                'form' => $form->createView(),
                'section' => $section,
            ])
        ]);

    }

    // Création d'une section

    #[Route('/professeur/contenu_ue-{codeUe}/section/create', name: 'section_create', methods: ['GET', 'POST'])]
    public function createSection(string $codeUe, Request $request, EntityManagerInterface $entityManager, EntityManagerInterface $BDDManager)
    {
        // création d'une section vide
        $section = new Section();

        $connection = $BDDManager->getConnection();


        // recuperation de la lsite des postes
        $sql_liste_publications = '
                SELECT titre, description, contenu, derniere_modif, ordre, visible, section_id, utilisateur_id, type_publication_id, code_id
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
                'html' => $this->renderView('professeur/partials/_section.html.twig', [
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
            'html' => $this->renderView('professeur/create_section.html.twig', [
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



}
