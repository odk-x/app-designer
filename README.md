# ODK-X Application Designer 

This project is __*actively maintained*__

The developer [wiki](https://github.com/odk-x/tool-suite-X/wiki) (including release notes) and [issues tracker](https://github.com/odk-x/tool-suite-X/issues) are located under the [**ODK-X Tool Suite**](https://github.com/odk-x) project.

This repository contains the ODK-X Application Designer software.

Complete Android apps, including data entry, synchronization, and distribution,
can be written using HTML and JavaScript files. ODK-X Tables and ODK-X Survey will
serve these files as the skin of your app.

Projects intending to write a Tables app can clone this repository and use it
as a starting point.

Much of the boilerplate of app creation can be avoided by employing the Grunt
tasks specified in the Gruntfile.

## Setting up your environment

#### Prerequisites

- Java -> Java is required by the Android SDK (installation is described below).
- Chrome -> [Google's Chrome browser](https://www.google.com/intl/en/chrome/browser/desktop/index.html). 
- NodeJS -> a framework for easily building fast, scalable applications (installation is described below).
- Grunt -> a task-based scripting environment (installation is described below).
- Android SDK -> the software development kit for Android devices (installation is described below).

##### Java
Make sure Java 8 or higher is installed on the computer you plan to use.  If it is not, [download and install it](https://java.com/en/download/). If you are using MacOSX, it may require special care and attention.See [MacOSX Java install](https://docs.oracle.com/javase/8/docs/technotes/guides/install/mac_jdk.html) and [MacOSX Java FAQ](https://docs.oracle.com/javase/8/docs/technotes/guides/install/mac_install_faq.html).

##### NodeJS
You must use Version 12 or higher. To avoid directory path problems on Windows, we require npm version 6.9 or higher (generally npm will be bundled with NodeJS installer). Follow the [instructions to install NodeJS](https://nodejs.org/en/download/package-manager/).

###### For Windows
When installing on Windows you can use an automated **NodeJS** installer that uses **Chocolatey**. If you chose not to let the installer use **Chocolatey** to install a bunch of packages after installing **NodeJS**, you will need to ensure the location of the `npm` folder is added to the *PATH* variable of your system. If it is not, subsequent calls to access grunt will fail. For example: `C:\Users\[username]\AppData\Roaming\npm`. For instructions on modifying *PATH*, see the section at the bottom of this page called Add adb to your *PATH* For Windows. Instead of navigating to the location of Android SDK, navigate to the location of the `npm` folder.
You can check if npm has been installed properly by typing `npm --version` in cmd or Powershell.

###### For Mac/Linux
After installing NodeJS, open a terminal (which you can do by clicking the spotlight in the top right corner of the screen, typing terminal, and clicking the program named Terminal) and type: ```$ npm --version```

**Warning:**
If a number is not displayed, but you instead receive a message that the command npm cannot be found, you will have to perform some additional configuration.

As of this writing, by default NodeJS installs its commands into `/usr/local/bin/`. In the **terminal**, type:
```
$ ls /usr/local/bin/npm
```
If this command outputs something like `/usr/local/bin/npm`, but you are still unable to run:
```
$ npm --version
```
try running:
```
$ /usr/local/bin/npm --version
```
If this is successful, then **npm** is successfully installed, and you will just have to add `/usr/local/bin/` to your system *PATH* variable (see below).
If the command:
```
$ ls /usr/local/bin/npm
```
outputs a message telling you permission is denied, then you will have to change the ownership of the `/usr/local/` and `/usr/local/bin/` directories. On Mac, follow the [instructions to take ownership](http://osxdaily.com/2013/04/23/change-file-ownership-mac-os-x/) of these directories, or to at least give yourself read permission. On other Linux systems, use the **chown** command or the user-interface appropriate to your distribution to do so.

##### Grunt
After installing NodeJS, install **grunt** by doing the following:
**Note:** These installation steps are copied from the [Grunt Getting Started guide](https://gruntjs.com/getting-started).
On Windows, open a **cmd** window (go to Start Menu, search for **cmd** and open it); on MacOSX, open a **terminal** window. Within this window, type:
```
$ npm install -g grunt-cli
```
If the above command is unsuccessful, some machines may need to append sudo at the beginning of the command. If **grunt** is successfully installed, the following command:
```
$ grunt --version
```
Should display the installed version of **grunt**. For example the version might be `grunt-cli v1.2.0`.
**Warning:** If **grunt** is not found, you may need to add it to the *PATH* variable of your system.

##### Android SDK
To install the Android SDK:
1) Browse to the Android SDK download page.
2) Scroll down on this page to the section labeled: Get just the command line tools.
   **Note**: You can alternatively install the full Android Studio if you so wish, in which case you should follow Google's instructions and then skip to step 6 of this guide.
3) Within that section, download the appropriate file(s) based on your operating system.  
4) Accept the license agreement    
5) Wait for the install of the SDK Tools to complete. Windows will need to manually run the .exe file previously downloaded to start installation.    
Note: There is no graphical tool for package management when using only the command line tools in either of Mac/Windows/Linux. You need to do a complete setup of Android Studio, more information in step 7.
6) Run the SDK Manager
   - On Windows, it is available in the `Start Menu` under Android SDK Tools
   **Warning:** If the packages fail to install, you may need to run the Android SDK as an Administrator.
   - On Mac/Linux, there is a `sdkmanager` CLI, more information can be found [here](https://developer.android.com/studio/command-line/sdkmanager).
7) Select the latest versions of the following packages (by checking their checkboxes):
    - Android SDK Tools
    - Android Platform-tools
    - Android Build-tools

    -For this step on Mac/Linux, you'll need to make a complete setup of [Android Studio](https://developer.android.com/studio/install#mac). You may skip the steps 8-11 since, the above tools will be included in the Android Studio install you just did.
8) If extra packages are selected, you may unselect them before installation.    
9) Click `Install 3 packages` in the lower right corner of the screen.    
10) A licensing pop-up dialog will appear. Accept the license agreement(s) by selecting the `Accept License` option. If there are multiple licenses, you may need to select each license in the Packages window on this dialog and check this `Accept License` option for each of them before the `Install` button will become enabled.    
11) Click the `Install` button on that dialog to begin the installation process.

Among many other things, this will install the Android Debug Bridge software on your computer. This tool enables the scripted pushing of files and APKs down to your Android device. See [adb (Android Debug Bridge)](https://developer.android.com/studio/command-line/adb.html) for a listing of its capabilities.

Next, on Windows open a **cmd** window (open the Start menu, type **cmd** in the search box, select and open it), and on Mac/Linux open a **terminal** window. Type:
```
$ adb version
```
If this displays a version string, then your installation is complete; you are done with this section and can move on to [Installing Application Designer](#installing-application-designer).

**Warning:** 
    - If there is an error complaining about Java not being installed, you will need to close this **cmd** or **termina**l window and download and install Java. After installing Java, open a new **cmd** or **terminal** window and type this command again.
    - If **adb** is not found, then you need to add it to the *PATH* variable of your system.

##### Add adb to your PATH
###### For Windows
1) Open a Windows File Explorer and navigate to the location of your Android SDK. This will typically be at one of: `C:\Users\your_username\android-sdks` or `C:\ProgramFiles\Android\android-sdk` or `C:\Program Files (x86)\Android\android-sdk`.
2) Navigate into the `platform-tools` folder.
3) Click in the file path at the top of the File Explorer window. The path will become aselected text string. Copy it into your copy-and-paste buffer.
4) Open the Start menu.
5) Right-click on **`Computer`**.
6) Choose **`Properties`**. The System Control Panel screen opens.
7) Select **`Advanced system setting`** on the left sidebar. The System Properties dialog opens.
8) Click on the **`Environment Variables...`** button at the bottom of the screen. The Envi-ronment Variables dialog opens.
9) Select the **`Path`** variable in the bottom System variables scroll window.
10) Click **`Edit...`**
11) Click into the **`Variable value`** text box.
12) Press your **`End`** key to move to the very end of this extremely long string.
13) Enter ’;’ and paste the `platform-tools` directory path after that semicolon.
14) Click on **`OK`** and exit all of the windows.
15) Verify that you have made the change by closing all **cmd** windows and open a new one(so it picks up the change), and type
```
$ adb version
```
You should now see the version of the **adb** tool. For example: `Android Debug Bridge version 1.0.31`. You can now move on to [Installing Application Designer](https://docs.odk-x.org/app-designer-install/).

###### For Mac/Linux
The *PATH* variable is nothing more than a default list of places the system looks for commands. Open a **terminal**. Type:
```
$ echo $PATH
```
You will see a colon-separated list of folders on your computer. (echo means just print whatever comes next, and the `${ }` means that the system will treat *PATH* as a variable, not a program. You don't need to know this to follow these instructions, but knowledge is power.) For example, you might see something like this:
```
$ echo $PATH
  /usr/local/bin:/usr/local/sbin:/usr/bin:/bin
```
This means that when you type:
```
$ adb --version
```
the system will look for the command called **adb** in the directories `/usr/local/bin/`, `/usr/local/sbin/`, `/usr/bin/`, and `/bin/`.
Note the location where you downloaded the Android SDK. It should contain a folder called `platform-tools`, which itself contains the program **adb**. If this was in the folder `/Users/someuser/Desktop/android-sdk/` you should be able to run:
```
$ /Users/someuser/Desktop/android-sdk/platform-tools/adb --version
```
This works because we're telling the computer exactly where the program **adb** exists. By putting the `platform-tools` directory on the system's *PATH* variable, we will be able to just type **adb** and have the system find it in the `/Users/someuser/Desktop/android-sdk/platform-tools/` directory.
This process is more involved on Mac/Linux than on Windows. Use a text editor (not **Word**, but something like **TextEdit**), select the option to open a file, and browse to your home directory. You can find your home directory by typing:
```
$ echo ~
```
in a **terminal**. ('~' is a shortcut for the home directory.) Macs use a hidden file called `.zsh` in the home directory to set variables like *PATH*. Other Linux systems use files like `.bashrc`. You might have to check the specifics for your distribution to know which you should use. Open the appropriate file. If the file does not already exist, create a new file that will be saved with the appropriate name in your home directory.
We want to add the location of the **adb** tool to your *PATH* while preserving the existing *PATH* information. Assuming that your **adb** program is in the `/Users/someuser/Desktop/android-sdk/platform-tools/` directory, you would add the following command to the end of the `.zshrc` file:
```
$ export PATH=${PATH}:/Users/someuser/Desktop/android-sdk/platform-tools
```
Save the file, close the **terminal** window, open a new **terminal** window, and type:
```
$ echo $PATH
```
You should see your old path with the new directory you added above, and you should now be able to run:
```
$ adb --version
```

**Tip:** If you are going to be heavily customizing the look-and-feel of the application with a lot of external JavaScript libraries, you might also choose to install **bower**.

## Installing Application Designer
Open a **Terminal** and type
```
$ git clone https://github.com/odk-x/app-designer.git
```
If you're using **Github Desktop**, clone [this repository](https://github.com/odk-x/app-designer) by clicking on `Code`.

Now you need to install the node packages:
```
$ cd app-designer
$ npm install grunt --save-dev
```

To open Application Designer, navigate to the location of your local cloned repository in **cmd**/**Terminal**, and type: 
```
$ grunt
```
This command runs the script contained in **Gruntfile.js**, so be sure it is in the current directory. If the Chrome browser does not open, try opening it yourself and browsing to [http://localhost:8000/index.html](http://localhost:8000/index.html).

If the page never times-out, but never loads (it remains blank or constantly spinning), then stop grunt and try this command instead:
```
$ grunt --verbose connect:livereload:keepalive
```
This will start grunt, but disable the file-change detection mechanisms that automatically reload an HTML page when it or any JavaScript file it uses has been modified. Others have reported that uninstalling npm and node, and then re-installing them may correct the issue.

#### Windows Users Tip
You will be opening a **cmd** window and changing your current directory (using the **cd** command) into this directory every time you use this tool.  It is therefore useful to create a shortcut that opens a cmd window directly into this directory:
1) Open a file browser and navigate to the unzipped directory containing a number of files and directories, including a **Gruntfile.js**.
2) Click into the top location bar that displays the nested list of folders to this folder.
3) Copy this path to the cut-and-paste buffer.
4) Now, move down to the list of files, right-click.
5) Select *New...,Shortcut*.
6) Type **cmd** for the location of the item.
7) Click Next, and then Finish.
8) Select this newly-created **cmd.exe** shortcut and right-click.
9) Select *Properties*.
10) Click on the *Start in* text box, delete its contents, and paste the path to this folder.
11) Click *OK* to accept the change.
12) Double-click the **cmd.exe** shortcut to open a **cmd** window.
13) Confirm that it opens in the intended directory (you should see the full path to that directory displayed to the left of the blinking cursor).

#### MacOSX Users Tip
Terminal will open a new terminal window if you drag a folder (or pathname) onto the Terminal application icon, and you can also drag a folder to the tab bar of an existing window to create a new tab in that folder.

You have now completed the installation of the ODK-X Application Designer software.

## How to contribute
If you’re new to ODK-X you can check out the documentation:
- [https://docs.odk-x.org](https://docs.odk-x.org)

Once you’re up and running, you can choose an issue to start working on from here: 
- [https://github.com/odk-x/tool-suite-X/issues](https://github.com/odk-x/tool-suite-X/issues)

Issues tagged as [good first issue](https://github.com/odk-x/tool-suite-X/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22) should be a good place to start.

Pull requests are welcome, though please submit them against the development branch. We prefer verbose descriptions of the change you are submitting. If you are fixing a bug please provide steps to reproduce it or a link to a an issue that provides that information. If you are submitting a new feature please provide a description of the need or a link to a forum discussion about it. 

## Links for users
This document is aimed at helping developers and technical contributors. For information on how to get started as a user of ODK-X, see our [online documentation](https://docs.odk-x.org), or to learn more about the Open Data Kit project, visit [https://odk-x.org](https://odk-x.org).
