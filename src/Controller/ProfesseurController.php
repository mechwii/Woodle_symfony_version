<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

final class ProfesseurController extends AbstractController
{
    // Crééation de la route pour arriver sur la page Choix_UE apres le login
    #[Route('/professeur', name: 'app_professeur')]
    public function index(): Response
    {
        $data = [["code"=>"WE4A", "nom"=>"Développement Web", "responsable"=>"Fabrice Ambert", "nb_lessons"=>12, "favorite"=>true ? "true" : "false"]];

        return $this->render('professeur/index.html.twig', [
            'controller_name' => 'ProfesseurController',
            'data' => $data,
        ]);
    }

}
