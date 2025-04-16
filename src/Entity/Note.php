<?php

namespace App\Entity;

use App\Repository\NoteRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: NoteRepository::class)]
class Note
{
    // Pour cette classe ajouter inversed etc dans controle et utilisateur
    #[ORM\Id]
    #[ORM\ManyToOne]
    #[ORM\JoinColumn(name: "utilisateur_id", referencedColumnName: "id_utilisateur", nullable: false)]
    private ?Utilisateur $utilisateur_id = null;

    #[ORM\Id]
    #[ORM\ManyToOne]
    #[ORM\JoinColumn(name: "controle_id", referencedColumnName: "id_controle", nullable: false)]
    private ?Controle $controle_id = null;

    #[ORM\Column]
    private ?int $resultat = null;

    public function getUtilisateurId(): ?Utilisateur
    {
        return $this->utilisateur_id;
    }

    public function setUtilisateurId(?Utilisateur $utilisateur_id): static
    {
        $this->utilisateur_id = $utilisateur_id;

        return $this;
    }

    public function getControleId(): ?Controle
    {
        return $this->controle_id;
    }

    public function setControleId(?Controle $controle_id): static
    {
        $this->controle_id = $controle_id;

        return $this;
    }

    public function getResultat(): ?int
    {
        return $this->resultat;
    }

    public function setResultat(int $resultat): static
    {
        $this->resultat = $resultat;

        return $this;
    }
}
