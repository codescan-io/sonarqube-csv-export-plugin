package com.villagechief.sonarqube.csv;

import org.sonar.api.Plugin;

public class CsvExportPlugin implements Plugin {
    @Override
    public void define(Context context) {
        context.addExtension(
                CsvExportPage.class
        );
    }
}
