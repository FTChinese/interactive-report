#Usage

`git clone https://github.com/FTChinese/special-report.git`

Run `gulp serve` for development.

Run `gulp` to build the final files for distribution.

Run `gulp deploy` for production.

## Update submodule

    git submodule update --remote interactive-assets

# Custom css and js

Custom css should be put into `app/styles/custom.css` and js into `app/scripts/visual.js`.

# Change backgrounds

`app/styles/backgrounds.css` is left for you to add/alter custom background images. Run `gulp serve` to preview before making changes.

## Cover Image

Do not add cover image via `background.css`. To add a cover image, find `<img class="story-cover" src="" />` following the `body` tag and replace `src` with your cover image path.

# Tags usage

## `<cite>`

The title of a work should be put into this tag:

	`<cite>图书 论文 报刊 诗歌 音乐 影视 雕塑 绘画 戏剧 展览 法律报告 等标题</cite>`

## `<figure>`

This tag is used to wrap either a quotation of image with a caption:

	<figure>
	    <blockquote>‘选择标准不应基于表现，而应基于个性。在中国，谦逊才能成事，粗鲁只会碰壁’</blockquote>
	    <footer>中欧国际工商学院(Ceibs)副教授金台烈(Tae-Yeol Kim)</footer>
	</figure>

    <figure>
        <img alt="myimage" src="myimage.png">
        <figcaption>Image Caption</figcaption>
    </figure>

## Scrollmation

### Text flow over fixed background
    <div class="scrollmation scrollmation-background">                            
        <div class="tiny-scrollmation sticky-element"></div>

        <div class="two-column-grid">
            <div class="primary-wrapper">
                <div class="primary-column flow-element">
                    <p>Text</p>
                </div>
            </div>
        </div>
    </div>

Set background-image on the `tiny-scrollmation` element. The `tiny-scrollmation` element is initially absolutely positioned top-left. When the top border of `primary-column` touches the top edge of the window, `tiny-scrollmation` will be set `position:fixed`. The text flows while background is fixed. When the bottom border of `primary-column` touches the bottom of the window, `tiny-scrollmation` will be absolutely positioned to the bottom of the containing lement and flow away together with `primary-column`.

### Two column scrollmation

For two column scrollmation, it should be put into the following tags:

    <div class="primary-column flow-element">
        <p>Contents on the left.</p>
        <div class="aside-wrapper sticky-element">
            Contents on the right. fixed while the left scrolled
        </div>
        <p>Contents on the left continues.</p>
    </div>

Elements with class name `flow-element` will scroll as normal while elements inside it with class name `sticky-element` will be fixed on the right.

# Todo
- Try to use jQuery scrollTo for scrollmation
- Replace local image path with FT responsive service on deploy
- Integrate compass mixins
- Split structure and data, probably with mustache and yaml/markdown.
- Make css and js available to all projects cloned without manual copy. Use Git submodule or release main files as a component?
