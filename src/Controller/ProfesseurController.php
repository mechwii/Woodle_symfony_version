<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

// On ajoute le bon repo
use App\Repository\UERepository;
use App\Repository\EstAffecteRepository;

final class ProfesseurController extends AbstractController
{
    // Crééation de la route pour arriver sur la page Choix_UE apres le login
    #[Route('/professeur', name: 'app_professeur')]
    public function index(UERepository $ueRepository, EstAffecteRepository $estAffecteRepository): Response
    {
        $data = [
            ["code"=>"WE4A", "nom"=>"Développement Web", "responsable"=>"Fabrice Ambert", "nb_lessons"=>12, "favorite"=>true ? "true" : "false"],
            ["code"=>"APAYA", "nom"=>"Développement Web", "responsable"=>"Fabrice Ambert", "nb_lessons"=>12, "favorite"=>false ? "true" : "false"],
            ["code"=>"FERG", "nom"=>"Développement Web", "responsable"=>"Fabrice Ambert", "nb_lessons"=>12, "favorite"=>true ? "true" : "false"],
            ["code"=>"DGFG", "nom"=>"Développement Web", "responsable"=>"Fabrice Ambert", "nb_lessons"=>12, "favorite"=>true ? "true" : "false"],
            ["code"=>"TYJ", "nom"=>"Développement Web", "responsable"=>"Fabrice Ambert", "nb_lessons"=>12, "favorite"=>true ? "true" : "false"],
            ["code"=>"TYJT", "nom"=>"Développement Web", "responsable"=>"Fabrice Ambert", "nb_lessons"=>12, "favorite"=>false ? "true" : "false"],
            ["code"=>"SDFS", "nom"=>"Développement Web", "responsable"=>"Fabrice Ambert", "nb_lessons"=>12, "favorite"=>true ? "true" : "false"],
            ["code"=>"ERGERH", "nom"=>"Développement Web", "responsable"=>"Fabrice Ambert", "nb_lessons"=>12, "favorite"=>true ? "true" : "false"],
            ["code"=>"WETHRTH4A", "nom"=>"Développement Web", "responsable"=>"Fabrice Ambert", "nb_lessons"=>12, "favorite"=>true ? "true" : "false"],
            ["code"=>"RTH", "nom"=>"Développement Web", "responsable"=>"Fabrice Ambert", "nb_lessons"=>12, "favorite"=>false ? "true" : "false"],
            ["code"=>"EZRF", "nom"=>"Développement Web", "responsable"=>"Fabrice Ambert", "nb_lessons"=>12, "favorite"=>true ? "true" : "false"],
            ["code"=>"ZR", "nom"=>"Développement Web", "responsable"=>"Fabrice Ambert", "nb_lessons"=>12, "favorite"=>true ? "true" : "false"],
            ["code"=>"RZER", "nom"=>"Développement Web", "responsable"=>"Fabrice Ambert", "nb_lessons"=>12, "favorite"=>false ? "true" : "false"],
            ["code"=>"RZ", "nom"=>"Développement Web", "responsable"=>"Fabrice Ambert", "nb_lessons"=>12, "favorite"=>true ? "true" : "false"],
            ["code"=>"ZRZER", "nom"=>"Développement Web", "responsable"=>"Fabrice Ambert", "nb_lessons"=>12, "favorite"=>true ? "true" : "false"],
            ["code"=>"HTRH", "nom"=>"Développement Web", "responsable"=>"Fabrice Ambert", "nb_lessons"=>12, "favorite"=>false ? "true" : "false"],
            ["code"=>"HRHRJ-", "nom"=>"Développement Web", "responsable"=>"Fabrice Ambert", "nb_lessons"=>12, "favorite"=>true ? "true" : "false"],
            ["code"=>"H-U-U", "nom"=>"Développement Web", "responsable"=>"Fabrice Ambert", "nb_lessons"=>12, "favorite"=>true ? "true" : "false"],

        ];

        $user = $this->getUser(); // récupération du prof connecté

        $ues = $ueRepository->findAll();
        $uesAssociees = $estAffecteRepository->trouverUEParUtilisateur($user);

        return $this->render('professeur/index.html.twig', [
            'controller_name' => 'ProfesseurController',
            'data' => $data,
            'user' => $user,
            'ues' => $ues,
            'uesa' => $uesAssociees,
        ]);
    }

}
