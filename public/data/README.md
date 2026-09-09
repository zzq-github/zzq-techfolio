# 地理数据来源

[`land-110m.geojson`](land-110m.geojson) 使用 Natural Earth 1:110m Land 数据，用于首页数字地球和静态后备地球的陆地轮廓展示，不用于精密测绘。

- 数据来源：[Natural Earth 官方数据仓库](https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_110m_land.geojson)。
- 原始文件：[ne_110m_land.geojson](https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_land.geojson)。
- 使用条件：Natural Earth 地图数据属于公有领域（public domain），详见 [官方使用条款](https://www.naturalearthdata.com/about/terms-of-use/)。

数据随站点静态资源提供，运行时不请求外部地图服务，也不需要地图访问令牌。替换数据时应保留来源说明，并验证 GeoJSON 能被现有地球渲染与后备组件读取。
