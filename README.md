# Climber Custom Report
### Self service without edit-mode for Qlik Sense!  

![Alt text](/screenshots/CustomReportSmaller.png?raw=true "Custom Report")

## Purpose and Description
In QlikView we saw a lot of users requesting a customizable straight table. Now that is possible in Qlik Sense too! The Custom Report extension allows you to create custom tables based on data in master tables. (For more info on customizable tables in QlikView, check out [this link](https://community.qlik.com/blogs/qlikviewdesignblog/2014/01/31/customizable-straight-table).)

First thing to do is create a table and make it a master item. The table is now accessible in Custom Report and you can select to show any or all measures and dimensions. Number format follows from the master item so no need to redo formatting! For full feature list see screenshots below.

Works only with Qlik Sense 3.0 and up!!


## Screenshots
1. Create Master Item Table
![Alt text](/screenshots/CreateMasterTable.PNG?raw=true "Create Table")
![Alt text](/screenshots/CreateMasterTable2.PNG?raw=true "Add to master items")
2. Select master item in the drop-down and choose what to show in the dimensions and measures. The custom table will be updated accordingly. Only dimensions and measures that are used will be calculated by Qlik Sense.https://community.qlik.com/blogs/qlikviewdesignblog/2014/01/31/customizable-straight-table
![Alt text](/screenshots/CustomReport.PNG?raw=true "Custom Report")
3. Sorting of columns by drag and drop. 
![Alt text](/screenshots/DragAndDropToSort.png?raw=true "Drag and drop to sort")
4. The table used is a standard Qlik Sense table so all standard features such as export and sorting are available. 
![Alt text](/screenshots/StandardTableExport.PNG?raw=true "Standard table export and sort")
5. Using a minimized version of the object you can put a custom report on any sheet along with the rest of the visualizations. Click arrows to expand to full screen!
![Alt text](/screenshots/Minimized.png?raw=true "Minimized")
6. Right-click menu allows you to make changes even with fields/sortbar hidden
![Alt text](/screenshots/RightClickMenu.PNG?raw=true "Right-Click Menu")


## Installation

1. Download the latest version of Qlik Sense (3.0 or higher)
2. Qlik Sense Desktop
	* To install, copy all files in the .zip file to folder "C:\Users\[%Username%]\Documents\Qlik\Sense\Extensions\cl-customreport\"
3. Qlik Sense Server
	* See instructions [how to import an extension on Qlik Sense Server](http://help.qlik.com/sense/en-us/developer/#../Subsystems/Workbench/Content/BuildingExtensions/HowTos/deploy-extensions.htm)

## Configuration

* You can use tags in the master items to show only relevant master item tables. Choose your tag in the settings. (In the picture we used the tag "Custom report" but you can of course choose any tag you want.) 
![Alt text](/screenshots/UseTags.PNG?raw=true "Use tags to filter master items")
* If you don't like the colored dimensions and measures it is possible to make them colorless. There is also a default sorting option for the dimensions and measures.
![Alt text](/screenshots/ColorOrNoColor.PNG?raw=true "Use tags to filter master items")


## Contributing
Contributing to this project is welcome. The process to do so is outlined below:

1. Create a fork of the project
2. Work on whatever bug or feature you wish
3. Create a pull request (PR)

I cannot guarantee that I will merge all PRs.

## Know Issues
Due to a bug in Qlik Sense (versions prior to 3.1. SR2) using exports with a virtual proxy requires a workaround. Export the table as ususal. In the URL for the exported object just add the virtual proxy prefix after the server name. (The object is actually exported correctly but we can not get the correct path from Qlik Sense.)  
https://qlik.sense.server.com/tempcontent/c4ef2a92-2....  
https://qlik.sense.server.com/VIRTUAL_PROXY_PREFIX/tempcontent/c4ef2a92-2....  

## Author

**Karl Fredberg Sjöstrand @ Climber**
* http://github.com/ClimberAB


## Change Log

See [CHANGELOG](CHANGELOG.yml)

## License & Copyright
The software is made available "AS IS" without any warranty of any kind under the MIT License (MIT).

See [Additional license information for this solution.](LICENSE.md)