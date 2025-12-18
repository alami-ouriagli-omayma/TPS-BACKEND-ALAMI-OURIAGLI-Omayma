// Charger les données depuis le fichier JSON
fetch('pieces-autos.json')
  .then(response => {
    if (!response.ok) {
      throw new Error('Impossible de charger le fichier JSON');
    }
    return response.json();
  })
  .then(piecesData => {
    // creation de l'app vue
    const app = Vue.createApp({
      data() {
        return {
          pieces: piecesData,          // données depuis le JSON
          recherche: '',               // texte tapé dans la barre de recherche
          categorieSelectionnee: '',   // catégorie choisie
          dispoSeulement: false,       // checkbox disponibilité
          triPrix: '',                 // type de tri (asc/desc)
          panier: []                   // panier
        };
      },

      computed: {
        // Extraire toutes les catégories
        categories() {
          return [...new Set(this.pieces.map(p => p.categorie))];
        },

        // Filtrage + recherche + tri
        piecesFiltrees() {
          let resultat = this.pieces;

          // Recherche
          if (this.recherche.trim() !== '') {
            const r = this.recherche.toLowerCase();
            resultat = resultat.filter(p => p.nom.toLowerCase().includes(r));
          }

          // Filtrer par catégorie
          if (this.categorieSelectionnee) {
            resultat = resultat.filter(p => p.categorie === this.categorieSelectionnee);
          }

          // Filtrer par disponibilité
          if (this.dispoSeulement) {
            resultat = resultat.filter(p => p.disponible);
          }

          // Tri par prix
          if (this.triPrix === 'asc') {
            resultat = [...resultat].sort((a, b) => a.prix - b.prix);
          } else if (this.triPrix === 'desc') {
            resultat = [...resultat].sort((a, b) => b.prix - a.prix);
          }

          return resultat;
        }
      },

      methods: {
        ajouterAuPanier(piece) {
          this.panier.push(piece);
          alert(`${piece.nom} ajouté au panier !`);
        }
      }
    });

    app.mount('#app');
  })
  .catch(error => {
    console.error('Erreur lors du chargement des données:', error);
    alert('Erreur : Impossible de charger les pièces auto. Vérifiez que le fichier pieces-autos.json existe.');
  });