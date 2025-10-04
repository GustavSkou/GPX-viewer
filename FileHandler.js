class FileHandler {
  /**
   * 
   * @param {String} fileContent 
   * @param {String} fileName 
   * @returns {Route}
   */
  static fileToRoute(fileContent, fileName) {
    const lastDotIndex = fileName.lastIndexOf(".");
    const fileExtension = fileName.substring(lastDotIndex);

    switch (fileExtension) {
      case ".gpx":
        return GPXHandler.parseGPXToRoute(fileContent);

      case ".fit":
        throw new FileError(`Format ${fileExtension} is not supported`);

      default:
        throw new FileError(`Format ${fileExtension} is not supported`);
    }
  }
}