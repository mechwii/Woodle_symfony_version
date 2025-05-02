<?php
// Cette classe c'est pour rediriger tout ceux qui n'ont pas le droit dans leur page de droit
namespace App\Security;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\Routing\RouterInterface;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;
use Symfony\Component\Security\Http\Authorization\AccessDeniedHandlerInterface;

class AccessDeniedHandler implements AccessDeniedHandlerInterface
{
    private RouterInterface $router;
    private Security $security;

    public function __construct(RouterInterface $router, Security $security)
    {
        $this->router = $router;
        $this->security = $security;
    }

    /**
     * Ici on gère les redirections
     * @param Request $request
     * @param AccessDeniedException $accessDeniedException
     * @return Response|null
     */
    public function handle(Request $request, AccessDeniedException $accessDeniedException): ?Response
    {
        $user = $this->security->getUser();

        if (!$user) {
            return new RedirectResponse($this->router->generate('app_login'));
        }

        // Ici on rcupère le role de l'utilisateur, et en fonction de son rôle on le redirige
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

        return new RedirectResponse($this->router->generate('app_home'));
    }
}