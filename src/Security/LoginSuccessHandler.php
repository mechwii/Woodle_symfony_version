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

    public function onAuthenticationSuccess(Request $request, TokenInterface $token): RedirectResponse
    {
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

        // fallback
        return new RedirectResponse($this->router->generate('app_home'));
    }
}