<?php

namespace App\Repository;

use App\Entity\EstAffecte;
use App\Entity\Utilisateur;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<EstAffecte>
 */
class EstAffecteRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, EstAffecte::class);
    }

    //    /**
    //     * @return EstAffecte[] Returns an array of EstAffecte objects
    //     */
    //    public function findByExampleField($value): array
    //    {
    //        return $this->createQueryBuilder('e')
    //            ->andWhere('e.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->orderBy('e.id', 'ASC')
    //            ->setMaxResults(10)
    //            ->getQuery()
    //            ->getResult()
    //        ;
    //    }

    //    public function findOneBySomeField($value): ?EstAffecte
    //    {
    //        return $this->createQueryBuilder('e')
    //            ->andWhere('e.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->getQuery()
    //            ->getOneOrNullResult()
    //        ;
    //    }

    // src/Repository/EstAffecteRepository.php

    public function findUeOfUser(int id): array
    {
        return $this->createQueryBuilder('liaison')
            ->join('liaison.code_id', 'ue') // On joint la relation vers UE
            ->addSelect('ue')               // On sélectionne UE explicitement
            ->where('liaison.utilisateur_id = :utilisateur')
            ->setParameter('utilisateur', $utilisateur)
            ->getQuery()
            ->getResult();
    }

}
