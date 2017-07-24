package com.villagechief.sonarqube.csv;

import org.sonar.api.web.page.Context;
import org.sonar.api.web.page.Page;
import org.sonar.api.web.page.PageDefinition;

public class CsvExportPage implements PageDefinition {
    @Override
    public void define(Context context) {
        //Key format: <plugin_key>/<page_id>
        context.addPage(Page.builder("csvexport/global").setName("Csv issue export").build());
    }
}
