transcripts = [
    {"role":"agent","content":"Bonjour..."},
    {"role":"user","content":"Très bien, merci Alexa."},
    {"role":"user","content":"Non, je vous parle d'autre chose."},
    {"role":"user","content":"Oui, Fabien me doit encore 1000€..."},
    {"role":"user","content":"Transférez-moi directement."}
]
 // role user !! 
[
 "Très bien, merci Alexa.",
 "Non, je vous parle d'autre chose.",
 "Oui, Fabien me doit encore 1000€, dites-lui de me donner assez rapidement.",
 "Transférez-moi directement."
]
///////////////////////////////////////////////////////// NLP  /////////////////////////////////////////////////////////
//3 Preprocessing (normalize, stopwords, stemming)
[
 "bien merci alexa", 
 "parler chose",
 "fabien devoir euro donner rapidement",
 "transférer directement"
]

//4️Convert texts to embeddings ( )
(4, 384)
...
//5️Calculate similarity (analyse sémantique)   Valeur: 1 → phrases identiques, 0 → phrases totalement différentes.
[[1.0, 0.2, 0.1, 0.05],
 [0.2, 1.0, 0.05, 0.1],
 [0.1, 0.05, 1.0, 0.3],
 [0.05, 0.1, 0.3, 1.0]]
 ///////////////////////////////////////////////////////// NLP  /////////////////////////////////////////////////////////

// Clustering (KMeans)
[0, 1, 2, 2]
//Extract FAQ
{
 0= "Très bien, merci Alexa.",
 1= "Non, je vous parle d'autre chose.",
 2= "Oui, Fabien me doit encore 1000€, dites-lui de me donner assez rapidement."
}