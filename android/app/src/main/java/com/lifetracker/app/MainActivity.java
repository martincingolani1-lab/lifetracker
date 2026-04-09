package com.lifetracker.app;

import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.WindowManager;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // 1. Forzar que el contenido SE AJUSTE (no pase por detrás)
        WindowCompat.setDecorFitsSystemWindows(getWindow(), true);
        
        // 2. Asegurar colores sólidos en versiones compatibles
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            getWindow().setNavigationBarColor(android.graphics.Color.BLACK);
            getWindow().setStatusBarColor(android.graphics.Color.BLACK);
        }

        // 3. Limpiar banderas antiguas que Capacitor podría haber puesto
        // Esto asegura que NO estemos en modo "Layout Fullscreen"
        View decorView = getWindow().getDecorView();
        int uiOptions = decorView.getSystemUiVisibility();
        uiOptions &= ~View.SYSTEM_UI_FLAG_LAYOUT_STABLE;
        uiOptions &= ~View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION;
        uiOptions &= ~View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN;
        decorView.setSystemUiVisibility(uiOptions);
    }
}
