// Variables globales
let tousLesProduits = [];
let produitASupprimer = null;

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    chargerProduits();
    
    // Écouteurs d'événements
    document.getElementById('rafraichirBtn').addEventListener('click', chargerProduits);
    document.getElementById('saveProduitBtn').addEventListener('click', sauvegarderProduit);
    document.getElementById('confirmDeleteBtn').addEventListener('click', confirmerSuppression);
    document.getElementById('searchInput').addEventListener('input', filtrerProduits);
});

// Filtrer les produits
function filtrerProduits() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const produitsFiltres = tousLesProduits.filter(produit => 
        produit.nom.toLowerCase().includes(searchTerm) ||
        (produit.description && produit.description.toLowerCase().includes(searchTerm))
    );
    afficherProduits(produitsFiltres);
}

// Modifier un produit
async function modifierProduit(id) {
    try {
        const produit = await window.electronAPI.obtenirProduit(id);
        if (produit) {
            document.getElementById('modalTitle').innerHTML = '<i class="fas fa-edit me-2"></i>Modifier le produit';
            document.getElementById('produitId').value = produit.id;
            document.getElementById('nom').value = produit.nom;
            document.getElementById('description').value = produit.description || '';
            document.getElementById('prix').value = produit.prix;
            document.getElementById('stock').value = produit.stock;
            
            // Ouvrir le modal
            const modal = new bootstrap.Modal(document.getElementById('produitModal'));
            modal.show();
        }
    } catch (error) {
        console.error('Erreur lors de la récupération du produit:', error);
        afficherErreur('Impossible de récupérer le produit');
    }
}

// Sauvegarder un produit (création ou modification)
async function sauvegarderProduit() {
    const id = document.getElementById('produitId').value;
    const produit = {
        nom: document.getElementById('nom').value.trim(),
        description: document.getElementById('description').value.trim(),
        prix: parseFloat(document.getElementById('prix').value),
        stock: parseInt(document.getElementById('stock').value)
    };
    
    // Validation
    if (!produit.nom) {
        afficherErreur('Le nom du produit est requis');
        return;
    }
    
    if (isNaN(produit.prix) || produit.prix < 0) {
        afficherErreur('Le prix doit être un nombre valide');
        return;
    }
    
    if (isNaN(produit.stock) || produit.stock < 0) {
        afficherErreur('Le stock doit être un nombre valide');
        return;
    }
    
    try {
        if (id) {
            // Mise à jour
            produit.id = parseInt(id);
            await window.electronAPI.mettreAJourProduit(produit);
            afficherSucces('Produit modifié avec succès');
        } else {
            // Création
            await window.electronAPI.creerProduit(produit);
            afficherSucces('Produit créé avec succès');
        }
        
        // Fermer le modal et réinitialiser le formulaire
        const modal = bootstrap.Modal.getInstance(document.getElementById('produitModal'));
        modal.hide();
        resetFormulaire();
        
        // Recharger la liste
        await chargerProduits();
    } catch (error) {
        console.error('Erreur lors de la sauvegarde:', error);
        afficherErreur('Erreur lors de la sauvegarde du produit');
    }
}

// Demander confirmation de suppression
function demanderSuppression(id) {
    const produit = tousLesProduits.find(p => p.id === id);
    if (produit) {
        produitASupprimer = produit;
        document.getElementById('deleteProductName').textContent = produit.nom;
        const modal = new bootstrap.Modal(document.getElementById('deleteModal'));
        modal.show();
    }
}

// Confirmer la suppression
async function confirmerSuppression() {
    if (produitASupprimer) {
        try {
            await window.electronAPI.supprimerProduit(produitASupprimer.id);
            afficherSucces('Produit supprimé avec succès');
            
            // Fermer le modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('deleteModal'));
            modal.hide();
            
            // Recharger la liste
            await chargerProduits();
            
            // Réinitialiser la variable
            produitASupprimer = null;
        } catch (error) {
            console.error('Erreur lors de la suppression:', error);
            afficherErreur('Erreur lors de la suppression du produit');
        }
    }
}

// Réinitialiser le formulaire
function resetFormulaire() {
    document.getElementById('produitForm').reset();
    document.getElementById('produitId').value = '';
    document.getElementById('modalTitle').innerHTML = '<i class="fas fa-plus-circle me-2"></i>Nouveau Produit';
}

// Afficher un message de succès
function afficherSucces(message) {
    afficherNotification(message, 'success');
}

// Afficher un message d'erreur
function afficherErreur(message) {
    afficherNotification(message, 'danger');
}

// Afficher une notification
function afficherNotification(message, type) {
    // Créer un toast ou une alerte
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 end-0 m-3`;
    alertDiv.style.zIndex = '9999';
    alertDiv.style.minWidth = '300px';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alertDiv);
    
    // Auto-fermeture après 3 secondes
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.parentNode.removeChild(alertDiv);
        }
    }, 3000);
}