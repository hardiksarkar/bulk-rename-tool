const { rejects } = require("assert");
const fs = require("fs");
const path = require("path");
const readline = require("readline"); // for taking user inputs

// for taking user inputs in console
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const userInput = async (prompt) => {
  return new Promise((resolve) => {
    rl.question(prompt, (toReplace) => {
      resolve(toReplace);
    });
  });
};

const directoryPath = __dirname; //storing current directory path

let toReplace = "";
let replaceWith = "";
let confirm;

// take user input function and confirming file rename
const take_input = async () => {
  toReplace = await userInput("Please enter the word to replace : ");
  replaceWith = await userInput("Please enter the word to replace with : ");
  toReplace = toReplace.trim();
  replaceWith = replaceWith.trim();
  let c = 0;

  const confirmRename = () => {
    let temp = false;
    return new Promise((resolve, reject) => {
      fs.readdir(directoryPath, (err, files) => {
        if (err) {
          console.error("Error reading directory:", err);
          reject(err);
        }

        files.forEach((file) => {
          if (file !== "index.js") {
            // const oldFileName = path.join(directoryPath, file);
            const fileExt = path.extname(file); // extract file extension
            const fileBaseName = path.basename(file, fileExt); // extract file basename and removing extension
            const newFileName = path.join(
              directoryPath,
              `${fileBaseName.replaceAll(toReplace, replaceWith)}${fileExt}`
            );
            if (
              `${fileBaseName}${fileExt}` !== `${path.basename(newFileName)}`
            ) {
              c++;
              temp = true;
              console.log(
                `- ${fileExt===""?"Folder":"File"} ${fileBaseName}${fileExt} will be renamed to ${path.basename(
                  newFileName
                )}`
              );
            }
          }
        });
        if (temp) {
          resolve(true);
        } else {
          rl.close();
          reject(false);
        }
      });
    });
  };
  try {
    await confirmRename();
  } catch (error) {
    return false;
  }
  console.log("Warning! This action is irreversible.");
  while (true) {
    const confirmation = await userInput(
      `Are you sure you want to rename ${c} files and folders as above? (yes/no) : `
    );
    if (confirmation.trim().toLowerCase() === "yes") {
      confirm = true;
      break;
    } else if (confirmation.trim().toLowerCase() === "no") {
      confirm = false;
      break;
    } else {
      console.log('Invalid input. Please enter "yes" or "no".');
    }
  }

  rl.close();
};

// renaming files function
const fileRenameFunc = () => {
  let c = 0;
  return new Promise((resolve, reject) => {
    fs.readdir(directoryPath, async (err, files) => {
      if (err) {
        console.error("Error reading directory:", err);
        reject(err);
      }

      // 'files' is an array containing the names of all files and directories in the directoryPath.
      //   console.log('Contents of the directory:', files);

      for (const file of files) {
        if (file !== "index.js") {
          const oldFileName = path.join(directoryPath, file);
          const fileExt = path.extname(file); // extract file extension
          const fileBaseName = path.basename(file, fileExt); // extract file basename and removing extension
          const newFileName = path.join(
            directoryPath,
            `${fileBaseName.replaceAll(toReplace, replaceWith)}${fileExt}`
          );
          function fileRename() {
            return new Promise((resolve, reject) => {
              fs.rename(oldFileName, newFileName, (err) => {
                if (err) {
                  console.log("Error Renaming File : " + err);
                  reject(err);
                } else {
                  if (
                    `${fileBaseName}${fileExt}` !==
                    `${path.basename(newFileName)}`
                  ) {
                    c++;
                    // printing only if before and after files are not same
                    console.log(
                      `- ${fileExt===""?"Folder":"File"} ${fileBaseName}${fileExt} Renamed Successfully to ${path.basename(
                        newFileName
                      )}`
                    );
                  }
                  resolve(); // will resolve when renaming is successful for each file without an error
                }
              });
            });
          }
          await fileRename(); // awaits until all files are renamed successfully
        }
      }
      resolve(c);
    });
  });
};

(async () => {
  let x = await take_input();
  if (x == false) {
    console.log("No such files to rename!");
    return;
  }
  if (confirm) {
    const c = await fileRenameFunc(confirm);
    console.log(`All ${c} files and folders renamed successfully!`);
  } else {
    console.log("File renaming cancelled successfully!");
  }
})();
