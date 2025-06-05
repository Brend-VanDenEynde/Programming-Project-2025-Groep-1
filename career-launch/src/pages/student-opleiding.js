import './student-register.css';

export function renderStudentOpleiding(rootElement) {
  rootElement.innerHTML = `
    <div class="page-wrapper">
      <main class="form-box">
        <button class="close-button">X</button>

        <h3>Ik ben een</h3>
        <div class="radio-group">
          <label><input type="radio" name="jaar" value="1"> 1ste jaar</label>
          <label><input type="radio" name="jaar" value="2"> 2de jaar</label>
          <label><input type="radio" name="jaar" value="3"> 3de jaar</label>
        </div>

        <select class="opleiding-select">
          <option selected disabled>Opleiding</option>
          <option>Business IT</option>
          <option>Networks & Security</option>
          <option>Software Engineering</option>
          <option>Intelligent Robotics</option>
        </select>

        <button class="save-button">Save</button>
      </main>

      <footer class="footer">
        <a href="#">Privacy Policy</a> | <a href="#">Contacteer Ons</a>
      </footer>
    </div>
  `;
}
