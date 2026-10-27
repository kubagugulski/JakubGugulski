import { test, expect } from '@playwright/test';

const URL = 'https://demo.playwright.dev/todomvc/';

// Antes de cada prueba se abre la aplicación (pruebas independientes)
test.beforeEach(async ({ page }) => {
  await page.goto(URL);
});

// Función para crear varias tareas
async function crearTareas(page, tareas) {
  const input = page.getByPlaceholder('What needs to be done?');
  for (const tarea of tareas) {
    await input.fill(tarea);
    await input.press('Enter');
  }
}

test.describe('Actividad 2. Creación y validación de tareas', () => {

  test('CP01 - Crear una tarea', async ({ page }) => {
    await crearTareas(page, ['Estudiar Playwright']);

    await expect(page.getByText('Estudiar Playwright')).toBeVisible();
    await expect(page.getByTestId('todo-item')).toHaveCount(1);
    await expect(page.getByTestId('todo-count')).toHaveText('1 item left');
  });

  test('CP02 - Crear tres tareas seguidas', async ({ page }) => {
    await crearTareas(page, ['Tarea 1', 'Tarea 2', 'Tarea 3']);

    // número de tareas
    await expect(page.getByTestId('todo-item')).toHaveCount(3);
    // contenido y orden de cada tarea
    await expect(page.getByTestId('todo-title')).toHaveText(['Tarea 1', 'Tarea 2', 'Tarea 3']);
    // contador
    await expect(page.getByTestId('todo-count')).toHaveText('3 items left');
  });

  test('CP03 - No se crea una tarea vacía o con solo espacios', async ({ page }) => {
    const input = page.getByPlaceholder('What needs to be done?');

    await input.fill('');
    await input.press('Enter');
    await input.fill('     ');
    await input.press('Enter');

    await expect(page.getByTestId('todo-item')).toHaveCount(0);
  });

});

test.describe('Actividad 3. Estados y filtros', () => {

  test('CP04 - Marcar una tarea como completada', async ({ page }) => {
    await crearTareas(page, ['Tarea 1', 'Tarea 2', 'Tarea 3']);
    const primera = page.getByTestId('todo-item').nth(0);

    // antes de marcar: 3 pendientes
    await expect(page.getByTestId('todo-count')).toHaveText('3 items left');

    // marcar la primera tarea
    await primera.getByRole('checkbox').check();

    // verificar el cambio de estado
    await expect(primera.getByRole('checkbox')).toBeChecked();
    await expect(primera).toHaveClass(/completed/);
    await expect(page.getByTestId('todo-count')).toHaveText('2 items left');

    // desmarcar y volver al estado anterior
    await primera.getByRole('checkbox').uncheck();
    await expect(primera.getByRole('checkbox')).not.toBeChecked();
    await expect(page.getByTestId('todo-count')).toHaveText('3 items left');
  });

  test('CP05 - Filtros All, Active y Completed', async ({ page }) => {
    await crearTareas(page, ['Tarea 1', 'Tarea 2', 'Tarea 3']);
    await page.getByTestId('todo-item').nth(0).getByRole('checkbox').check();

    // Active: solo las pendientes
    await page.getByRole('link', { name: 'Active' }).click();
    await expect(page).toHaveURL(/#\/active/);
    await expect(page.getByTestId('todo-title')).toHaveText(['Tarea 2', 'Tarea 3']);

    // Completed: solo las completadas
    await page.getByRole('link', { name: 'Completed' }).click();
    await expect(page).toHaveURL(/#\/completed/);
    await expect(page.getByTestId('todo-title')).toHaveText(['Tarea 1']);

    // All: todas
    await page.getByRole('link', { name: 'All' }).click();
    await expect(page.getByTestId('todo-item')).toHaveCount(3);

    // contador de pendientes
    await expect(page.getByTestId('todo-count')).toHaveText('2 items left');
  });

});

test.describe('Actividad 4. Edición y eliminación', () => {

  test('CP06 - Editar una tarea con doble clic', async ({ page }) => {
    await crearTareas(page, ['Estudiar Playwright']);
    const tarea = page.getByTestId('todo-item').nth(0);

    // entrar en modo edición con doble clic
    await tarea.getByTestId('todo-title').dblclick();

    // cambiar el texto y guardar
    const campoEdicion = tarea.getByRole('textbox', { name: 'Edit' });
    await expect(campoEdicion).toBeVisible();
    await campoEdicion.fill('Preparar examen');
    await campoEdicion.press('Enter');

    // verificar el texto nuevo
    await expect(page.getByTestId('todo-title')).toHaveText(['Preparar examen']);
    await expect(page.getByText('Estudiar Playwright')).toBeHidden();
  });

  test('CP07 - Eliminar una tarea', async ({ page }) => {
    await crearTareas(page, ['Tarea 1', 'Tarea 2']);
    const primera = page.getByTestId('todo-item').nth(0);

    // el botón × solo aparece al pasar el ratón
    await primera.hover();
    await primera.getByRole('button', { name: 'Delete' }).click();

    // la tarea eliminada desaparece
    await expect(page.getByText('Tarea 1')).toBeHidden();
    await expect(page.getByTestId('todo-item')).toHaveCount(1);
    await expect(page.getByTestId('todo-title')).toHaveText(['Tarea 2']);
    await expect(page.getByTestId('todo-count')).toHaveText('1 item left');
  });

});