#!/bin/bash

echo "🔧 CORRECTION AUTOMATIQUE DES PROBLÈMES EXPO"
echo "=============================================="
echo ""

echo "✅ Étape 1/5 : Nettoyage du cache..."
rm -rf .expo
rm -rf node_modules/.cache

echo "✅ Étape 2/5 : Vérification des dépendances..."
npm install --legacy-peer-deps

echo "✅ Étape 3/5 : Installation des dépendances manquantes..."
npm install react-native-reanimated --legacy-peer-deps

echo "✅ Étape 4/5 : Configuration terminée !"
echo ""
echo "🚀 Étape 5/5 : Lancement en mode TUNNEL..."
echo ""
echo "📱 INSTRUCTIONS :"
echo "1. Attendez que le QR code s'affiche"
echo "2. Ouvrez Expo Go sur votre téléphone"
echo "3. Scannez le QR code"
echo "4. Attendez 30-60 secondes pour le premier chargement"
echo ""
echo "Si vous voyez une erreur, appuyez sur Ctrl+C et envoyez-moi l'erreur !"
echo ""

npx expo start --tunnel --clear
