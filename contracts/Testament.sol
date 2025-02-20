// SPDX-License-Identifier: MIT 
pragma solidity ^0.8.28; 
 
contract Testament { 
    // Variables principales du contrat 
    address public owner; 
    address public heir;           // Héritier désigné 
    address public notary;         // Notaire (tiers de confiance) 
    bool public isDeceased = false; // Statut du testateur 
    uint public unlockTime;        // Timestamp à partir duquel le testament peut être débloqué 
    string private documentHash;   // Hash privé du testament (ex : CID IPFS) 
 
    // Événements pour notifier les actions importantes 
    event TestamentUnlocked(address indexed heir, string documentHash); 
    event DeathConfirmed(address indexed confirmer); 
 
    // Modificateur : Vérifie que l'appelant est le testateur 
    modifier onlyOwner() { 
        require(msg.sender == owner, "Vous n'etes pas le testateur."); 
        _; 
    } 
 
    // Modificateur : Vérifie que l'appelant est le notaire 
    modifier onlyNotary() { 
        require(msg.sender == notary, "Vous n'etes pas le notaire."); 
        _; 
    } 
 
    // Modificateur : Vérifie que l'appelant est l'héritier 
    modifier onlyHeir() { 
        require(msg.sender == heir, "Vous n'etes pas l'heritier."); 
        _; 
    } 
 
    // Constructeur : initialise les données du testament 
    constructor(address _heir, address _notary, string memory 
_documentHash, uint _unlockDelay) { 
        owner = msg.sender;  // Le créateur du contrat devient le testateur 
        heir = _heir;        // Adresse de l'héritier 
        notary = _notary;    // Adresse du notaire 
        documentHash = _documentHash;  // Hash du testament (stocké de manière privée) 
        unlockTime = block.timestamp + _unlockDelay;  // Date à partir de laquelle le testament peut être consulté 
    } 
 
    // Fonction : Le notaire confirme le décès du testateur 
    function confirmDeath() public onlyNotary { 
        require(!isDeceased, "Deja confirme."); 
        isDeceased = true;  // Mise à jour de l'état à "décédé" 
        emit DeathConfirmed(msg.sender);  // Émet l'événement de confirmation 
    } 
 
    // Fonction : L'héritier peut débloquer le testament après la période définie 
    function unlockTestament() public onlyHeir returns (string memory) { 
        require(isDeceased, "Le testateur est encore en vie.");  // Vérifie que le décès est confirmé 
        require(block.timestamp >= unlockTime, "Periode d'attente non respectee.");  // Vérifie que la période d'attente est écoulée 
         
        emit TestamentUnlocked(heir, documentHash);  // Émet un événement indiquant le déblocage 
        return documentHash;  // Retourne le hash du testament à l'héritier 
    } 
 
    // Fonction : Permet au testateur de modifier l'héritier désigné 
    function updateHeir(address newHeir) public onlyOwner { 
        heir = newHeir; 
    } 
 
    // Fonction : Permet au testateur de modifier le notaire désigné 
    function updateNotary(address newNotary) public onlyOwner { 
        notary = newNotary; 
    } 
}