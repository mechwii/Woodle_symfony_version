<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

final class ProfesseurController extends AbstractController
{
    #[Route('/professeur', name: 'app_professeur')]
    public function index(): Response
    {
        return $this->render('professeur/index.html.twig', [
            'controller_name' => 'ProfesseurController',
        ]);
    }

    // Crééation de la route pour arriver sur la page Choix_UE apres le login
    #[Route('/professeur/choix_ue', name: 'professeur_choix_ue')]
    public function choixUE(): Response
    {
        return $this->render('professeur/choix_ue.html.twig');
    }
}
