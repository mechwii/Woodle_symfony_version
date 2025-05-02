<?php
namespace App\Security;

use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\RouterInterface;
use Symfony\Component\Security\Http\Authentication\AuthenticationSuccessHandlerInterface;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;

class LoginSuccessHandler implements AuthenticationSuccessHandlerInterface
{
    private RouterInterface $router;

    public function __construct(RouterInterface $router)
    {
        $this->router = $router;
    }

    /**
     * Quand l'authentification est réussi on redirige l'utilsiateur à sa page respective
     * @param Request $request
     * @param TokenInterface $token
     * @return RedirectResponse
     */
    public function onAuthenticationSuccess(Request $request, TokenInterface $token): RedirectResponse
    {
        // Une fois que l'utilisateur est authentifié, on se charge de directement le rediriger à sa bonne page
        $user = $token->getUser();
        $roles = $user->getRoles();

        if (in_array('ROLE_ADMINISTRATEUR', $roles)) {
            return new RedirectResponse($this->router->generate('app_admin'));
        }

        if (in_array('ROLE_PROFESSEUR', $roles)) {
            return new RedirectResponse($this->router->generate('app_professeur'));
        }

        if (in_array('ROLE_ELEVE', $roles)) {
            return new RedirectResponse($this->router->generate('app_etudiant'));
        }

        // Dans le cas ou l'utilisateur n'a pas de role on le renvoie sur la page d'accueil
        return new RedirectResponse($this->router->generate('app_home'));
    }
}