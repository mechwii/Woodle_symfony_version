<?php

namespace App\Entity;

use App\Repository\UtilisateurRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: UtilisateurRepository::class)]
#[ORM\Table(name: "utilisateur")]
class Utilisateur
{
    #[ORM\Id]
    #[ORM\Column(name: "id_utilisateur", type: "integer")]
    #[ORM\GeneratedValue(strategy: "IDENTITY")]
    // En postgreSQL on utilise le type SERIAL donc est obligé de faire comme ça, penser à remplacer le code de base
    private ?int $id = null;

    #[ORM\Column(length: 100)]
    private ?string $nom = null;

    #[ORM\Column(length: 100)]
    private ?string $prenom = null;

    #[ORM\Column(length: 255)]
    private ?string $email = null;

    #[ORM\Column(name: "mot_de_passe", length: 255)]
    private ?string $mot_de_passe = null;

    #[ORM\Column(length: 50, nullable: true)]
    private ?string $telephone = null;

    #[ORM\Column(name: "date_creation", type: Types::DATETIME_MUTABLE)]
    private ?\DateTimeInterface $date_creation = null;

    #[ORM\Column(name: "date_modification", type: Types::DATETIME_MUTABLE, nullable: true)]
    private ?\DateTimeInterface $date_modification = null;

    #[ORM\Column(length: 255)]
    private ?string $image = null;

    /**
     * @var Collection<int, Role>
     */
    #[ORM\ManyToMany(targetEntity: Role::class, inversedBy: 'utilisateurs')]
    // Ici on effectue la jointure dans une table donc la classe propriétaire (avec le inversed) donc on indique la classe et le nom auquel il fait référence
    // Dans l'autre classe donc Role on devra laisser comme c'est justee précisé le mapped qui inque le côté inverse
    #[ORM\JoinTable(
        name: 'possede',
        joinColumns: [new ORM\JoinColumn(name: 'utilisateur_id', referencedColumnName: 'id_utilisateur')],
        inverseJoinColumns: [new ORM\JoinColumn(name: 'role_id', referencedColumnName: 'id_role')]
    )]
    private Collection $roles;

    /**
     * @var Collection<int, EstAffecte>
     */
    #[ORM\OneToMany(targetEntity: EstAffecte::class, mappedBy: 'utilisateur_id')]
    private Collection $estAffectes;

    /**
     * @var Collection<int, Epingle>
     */
    #[ORM\OneToMany(targetEntity: Epingle::class, mappedBy: 'utilisateur_id')]
    private Collection $epingles;

    /**
     * @var Collection<int, Notification>
     *
    #[ORM\OneToMany(targetEntity: Notification::class, mappedBy: 'utilisateur_expediteur_id')]
    private Collection $notifications;
     * */

    public function __construct()
    {
        $this->roles = new ArrayCollection();
        //$this->notifications = new ArrayCollection();
        $this->estAffectes = new ArrayCollection();
        $this->epingles = new ArrayCollection();
    }

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

    public function getPrenom(): ?string
    {
        return $this->prenom;
    }

    public function setPrenom(string $prenom): static
    {
        $this->prenom = $prenom;

        return $this;
    }

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(string $email): static
    {
        $this->email = $email;

        return $this;
    }

    public function getMotDePasse(): ?string
    {
        return $this->mot_de_passe;
    }

    public function setMotDePasse(string $mot_de_passe): static
    {
        $this->mot_de_passe = $mot_de_passe;

        return $this;
    }

    public function getTelephone(): ?string
    {
        return $this->telephone;
    }

    public function setTelephone(?string $telephone): static
    {
        $this->telephone = $telephone;

        return $this;
    }

    public function getDateCreation(): ?\DateTimeInterface
    {
        return $this->date_creation;
    }

    public function setDateCreation(\DateTimeInterface $date_creation): static
    {
        $this->date_creation = $date_creation;

        return $this;
    }

    public function getDateModification(): ?\DateTimeInterface
    {
        return $this->date_modification;
    }

    public function setDateModification(?\DateTimeInterface $date_modification): static
    {
        $this->date_modification = $date_modification;

        return $this;
    }

    public function getImage(): ?string
    {
        return $this->image;
    }

    public function setImage(string $image): static
    {
        $this->image = $image;

        return $this;
    }

    /**
     * @return Collection<int, Role>
     */
    public function getRoles(): Collection
    {
        return $this->roles;
    }

    public function addRole(Role $role): static
    {
        if (!$this->roles->contains($role)) {
            $this->roles->add($role);
        }

        return $this;
    }

    public function removeRole(Role $role): static
    {
        $this->roles->removeElement($role);

        return $this;
    }

    /**
     * @return Collection<int, Notification>
     *
    public function getNotifications(): Collection
    {
        return $this->notifications;
    }

    public function addNotification(Notification $notification): static
    {
        if (!$this->notifications->contains($notification)) {
            $this->notifications->add($notification);
            $notification->setUtilisateurExpediteurId($this);
        }

        return $this;
    }

    public function removeNotification(Notification $notification): static
    {
        if ($this->notifications->removeElement($notification)) {
            // set the owning side to null (unless already changed)
            if ($notification->getUtilisateurExpediteurId() === $this) {
                $notification->setUtilisateurExpediteurId(null);
            }
        }

        return $this;
    }*/

    /**
     * @return Collection<int, EstAffecte>
     */
    public function getEstAffectes(): Collection
    {
        return $this->estAffectes;
    }

    public function addEstAffecte(EstAffecte $estAffecte): static
    {
        if (!$this->estAffectes->contains($estAffecte)) {
            $this->estAffectes->add($estAffecte);
            $estAffecte->setUtilisateurId($this);
        }

        return $this;
    }

    public function removeEstAffecte(EstAffecte $estAffecte): static
    {
        if ($this->estAffectes->removeElement($estAffecte)) {
            // set the owning side to null (unless already changed)
            if ($estAffecte->getUtilisateurId() === $this) {
                $estAffecte->setUtilisateurId(null);
            }
        }

        return $this;
    }

    /**
     * @return Collection<int, Epingle>
     */
    public function getEpingles(): Collection
    {
        return $this->epingles;
    }

    public function addEpingle(Epingle $epingle): static
    {
        if (!$this->epingles->contains($epingle)) {
            $this->epingles->add($epingle);
            $epingle->setUtilisateurId($this);
        }

        return $this;
    }

    public function removeEpingle(Epingle $epingle): static
    {
        if ($this->epingles->removeElement($epingle)) {
            // set the owning side to null (unless already changed)
            if ($epingle->getUtilisateurId() === $this) {
                $epingle->setUtilisateurId(null);
            }
        }

        return $this;
    }
}
