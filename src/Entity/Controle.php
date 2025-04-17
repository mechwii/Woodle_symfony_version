<?php

namespace App\Entity;

use App\Repository\ControleRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: ControleRepository::class)]
#[ORM\Table(name: "controle")]
class Controle
{
    #[ORM\Id]
    #[ORM\Column(name: "id_controle", type: "integer")]
    #[ORM\GeneratedValue(strategy: "IDENTITY")]
    private ?int $id = null;

    #[ORM\Column(length: 50)]
    private ?string $nom = null;

    // targetEntity: UE::class,
    #[ORM\ManyToOne(inversedBy: 'controles')]
    #[ORM\JoinColumn(name: "code_id", referencedColumnName: "code", onDelete: 'CASCADE')]
    private ?UE $code = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getNom(): ?string
    {
        return $this->nom;
    }

    public function setNom(string $nom): static
    {
        $this->nom = $nom;

        return $this;
    }

    public function getCode(): ?UE
    {
        return $this->code;
    }

    public function setCode(?UE $code): static
    {
        $this->code = $code;

        return $this;
    }
}
