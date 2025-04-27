<?php

namespace App\Controller;


use App\Entity\Utilisateur;
use App\Form\UserProfileType;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;

final class ProfilEdit extends AbstractController
{    /**
     * Modifie un utilisateur existant avec Ajax et validation de formulaire
     */
    #[Route('/edit-profil/{id}', name: 'edit_profil', methods: ['PUT'])]
    public function editProfil(
        Request                $request,
        EntityManagerInterface $entityManager,
        ValidatorInterface     $validator,
        int                    $id
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

            $originalNom = $utilisateur->getNom();
            $originalPrenom = $utilisateur->getPrenom();
            $originalPassword = $utilisateur->getPassword();

            $form = $this->createForm(UserProfileType::class, $utilisateur);

            $form->submit([
                'nom' => $data['nom'],
                'prenom' => $data['prenom'],
                'password' => $data['password'],
            ]);

            if (!$form->isValid()) {
                $errors = [];
                foreach ($form->getErrors(true) as $error) {
                    $errors[] = $error->getMessage();
                }
                return $this->json(['error' => 'Erreurs de validation', 'details' => $errors], Response::HTTP_BAD_REQUEST);
            }

            // Vérifier si des modifications ont été effectuées
            $informationsModifiees =
                $originalNom !== $data['nom'] ||
                $originalPrenom !== $data['prenom'] ||
                $originalPassword !== $data['password'];

            // Persister les modifications uniquement si nécessaire
            if ($informationsModifiees) {
                $entityManager->flush();
                return $this->json([
                    'success' => true,
                    'message' => 'Utilisateur modifié avec succès',
                    'user' => [
                        'id' => $utilisateur->getId(),
                        'nom' => $utilisateur->getNom(),
                        'prenom' => $utilisateur->getPrenom(),
                        'email' => $utilisateur->getEmail(),
                        'password' => $utilisateur->getPassword(),
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
                        'password' => $utilisateur->getPassword(),
                    ]
                ], Response::HTTP_OK);
            }

        } catch
        (\Exception $e) {
            return $this->json(['error' => 'Une erreur est survenue: ' . $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}