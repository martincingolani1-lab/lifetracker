import { Purchases, LOG_LEVEL } from '@revenuecat/purchases-capacitor';
import { Capacitor } from '@capacitor/core';

// Nota: Reemplaza con tus claves reales de RevenueCat una vez que crees el proyecto en su dashboard.
const REVENUECAT_ANDROID_KEY = 'goog_example_key_here';

export const initPurchases = async (userId: string) => {
    if (!Capacitor.isNativePlatform()) return;

    try {
        await Purchases.setLogLevel({ level: LOG_LEVEL.DEBUG });
        await Purchases.configure({
            apiKey: REVENUECAT_ANDROID_KEY,
            appUserID: userId
        });

        console.log('RevenueCat initialized correctly');
    } catch (e) {
        console.error('Error initializing RevenueCat:', e);
    }
};

export const getOfferings = async () => {
    if (!Capacitor.isNativePlatform()) return null;
    try {
        const offerings = await Purchases.getOfferings();
        return offerings;
    } catch (e) {
        console.error('Error getting offerings:', e);
        return null;
    }
};

export const purchasePackage = async (pack: any) => {
    try {
        const { customerInfo } = await Purchases.purchasePackage({ aPackage: pack });
        return customerInfo.entitlements.active['Pro'] !== undefined;
    } catch (e: any) {
        if (!e.userCancelled) {
            console.error('Purchase error:', e);
        }
        return false;
    }
};
